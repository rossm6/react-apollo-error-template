/*** SCHEMA ***/
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLBoolean,
} from 'graphql';

const PersonType = new GraphQLObjectType({
  name: 'Person',
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
  },
});

const peopleData = [
  { id: 1, name: 'John Smith' },
  { id: 2, name: 'Sara Smith' },
  { id: 3, name: 'Budd Deey' },
];


const PaymentMethod = new GraphQLObjectType({
  name: 'PaymentMethod',
  fields: {
    stripeId: { type: GraphQLString },
    brand: { type: GraphQLString },
    last4: { type: GraphQLInt }
  },
});


let paymentMethodData = [
  { stripeId: '1', brand: 'visa', last4: 1234 }
];


const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    people: {
      type: new GraphQLList(PersonType),
      resolve: () => peopleData,
    },
    stripePaymentMethods: {
      type: new GraphQLList(PaymentMethod),
      resolve: () => paymentMethodData,
    },
  },
});


const RemoveStripePaymentMethod = new GraphQLObjectType({
  name: 'RemoveStripePaymentMethod',
  fields: {
    ok: { type: GraphQLBoolean },
    paymentMethod: { type: PaymentMethod }
  }
});


const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    removeStripePaymentMethod: {
      type: RemoveStripePaymentMethod,
      args: {
        stripeId: { type: GraphQLString },
      },
      resolve: function (_, { stripeId }) {
        paymentMethodData = [];
        peopleData.pop()
        return {
          ok: true,
          paymentMethod: {
            stripeId
          }
        }
      }
    },
  },
});

const schema = new GraphQLSchema({ query: QueryType, mutation: MutationType });

/*** LINK ***/
import { graphql, print } from "graphql";
import { ApolloLink, Observable } from "@apollo/client";
function delay(wait) {
  return new Promise(resolve => setTimeout(resolve, wait));
}

const link = new ApolloLink(operation => {
  return new Observable(async observer => {
    const { query, operationName, variables } = operation;
    await delay(300);
    try {
      const result = await graphql(
        schema,
        print(query),
        null,
        null,
        variables,
        operationName,
      );
      observer.next(result);
      observer.complete();
    } catch (err) {
      observer.error(err);
    }
  });
});

/*** APP ***/
import React, { useState } from "react";
import { render } from "react-dom";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  gql,
  useQuery,
  useMutation,
} from "@apollo/client";
import "./index.css";

const ALL_PEOPLE = gql`
  query AllPeople {
    people {
      id
      name
    }
  }
`;

const ALL_PAYMENT_METHODS = gql`
  query AllPaymentMethods {
    stripePaymentMethods {
      stripeId
      brand
      last4
    }
  }
`;

const REMOVE_PAYMENT_METHOD = gql`
  mutation RemovePaymentMethod($stripeId: String) {
    removeStripePaymentMethod(stripeId: $stripeId) {
      ok
      paymentMethod {
        stripeId

      }
    }
  }
`;


function People() {

  const {
    loading,
    data,
  } = useQuery(ALL_PEOPLE, { fetchPolicy: 'network-only', });

  console.log("people", data);

  return (
    <div>UI is irrelevant for people.  User must check dev tools to see if network has been hit again for ALL_PEOPLE QUERY
      after removing the payment method.</div>
  )

}


function PaymentMethods({
  setState
}) {

  const stripeId = '1';

  const {
    loading,
    data,
  } = useQuery(ALL_PAYMENT_METHODS, {fetchPolicy: 'cache-first'});

  console.log("data", data);

  const [removeStripePaymentMethodMutation] = useMutation(REMOVE_PAYMENT_METHOD, {
    update: (cache, { data }) => {
      if (data?.removeStripePaymentMethod?.ok) {
        cache.modify({
          fields: {
            stripePaymentMethods: (existingPaymentMethods = [], { readField }) => {
              return existingPaymentMethods.filter(pm => readField('stripeId', pm) != stripeId)
            }
          }
        });
      }
    }
  });

  const removeStripePaymentMethod = () => {
    removeStripePaymentMethodMutation({
      variables: {
        stripeId: stripeId
      },
      optimisticResponse: {
        removeStripePaymentMethod: {
          ok: true,
          __typename: "RemoveStripePaymentMethod",
          paymentMethod: {
            stripeId: 'duh',
            __typename: "PaymentMethod",
          }
        }
      }
    })
    .then(res => setState(1))
  }

  return (
    <div>
      {
        data
          ?
          data.stripePaymentMethods.map((pm, i) => (
            <p key={i}>pm.brand</p>
          ))
          :
          null
      }
      <button onClick={removeStripePaymentMethod}>Remove Only Payment Method</button>
    </div>
  )

}


function App() {

  const [state, setState] = useState(0);

  return (
    <div>
      <People />
      <PaymentMethods setState={setState} />
    </div>
  );
}

const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      PaymentMethod: {
        keyFields: ["stripeId"],
      },
      RemoveStripePaymentMethod: {
        keyFields: ["paymentMethod", ["stripeId"]]
      }
    }
  }),
  link
});

render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);

