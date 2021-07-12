/*** SCHEMA ***/
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLEnumType,
} from 'graphql';



const AggregatedDailyClicksNode = new GraphQLObjectType({
  name: 'AggregatedDailyClicks',
  fields: {
    clicks: { type: GraphQLInt, resolve: (_) => { return _.clicks } },
    date: { type: GraphQLString, resolve: (_) => { return _.date } }
  }
});


const ClicksSummary = new GraphQLObjectType({
  name: 'ClicksSummary',
  fields: {
    total: {
      type: GraphQLInt,
      resolve: (_) => {
        return _.total;
      }
    }
  }
});


const DateRanges = new GraphQLEnumType({
  name: 'DateRanges',
  values: {
    'd': {
      'value': '1d'
    },
    'w': {
      'value': '1w'
    }
  }
});


const Clicks = new GraphQLObjectType({
  name: 'Clicks',
  fields: {
    days: {
      type: new GraphQLList(AggregatedDailyClicksNode),
      args: {
        dateRange: { type: DateRanges }
      },
      resolve: (_) => {
        return _.days;
      }
    },
    summary: {
      type: ClicksSummary,
      resolve: (_) => {
        return _.summary;
      }
    }
  }
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: {
      type: GraphQLID,
      resolve: (_) => {
        return 1
      }
    },
    clicks: {
      type: Clicks,
      args: {
        from: { type: GraphQLInt },
        to: { type: GraphQLInt },
        dateRange: { type: DateRanges }
      },
      resolve: (_) => {
        return _.clicks;
      }
    }
  },
});


const userData1 = {
  id: 1,
  clicks: {
    days: [{ date: '11/07/2021', clicks: 1 }],
    summary: {
      total: 1
    }
  }
};


const userData2 = {
  id: 1,
  clicks: {
    days: [{ date: '11/07/2021', clicks: 1 }, { date: '12/07/2021', clicks: 2 }],
    summary: {
      total: 3
    }
  }
};


const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    user: {
      args: {
        dateRange: { type: DateRanges }
      },
      type: UserType,
      resolve: (_, { dateRange }) => {
        console.log("server side date range", dateRange);
        if (dateRange == '1d') {
          return userData1;
        }
        return userData2;
      },
    },
  },
});


const schema = new GraphQLSchema({ query: QueryType });

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
import React, { useEffect, useState } from "react";
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


const GET_CLICKS_DATA = gql`
  query GET_CLICKS_DATA ($from: Int!, $to: Int!, $dateRange: DateRanges!){
    user (dateRange: $dateRange) {
      id
      clicks (from: $from, to: $to, dateRange: $dateRange) {
        days (dateRange: $dateRange) {
          date
          clicks
        }
        summary {
          total
        }
    }
   }
  }
`;

function App() {

  const [state, setState] = useState('d');

  const
    {
      data: clicksData,
      fetchMore: clicksFetchMore,
      loading: clicksLoading,
      called: clicksCalled
    } = useQuery(GET_CLICKS_DATA, {
      variables: {
        from: 1,
        to: 2,
        dateRange: 'd'
      },
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'cache-first',
      // Without the "nextFetchPolicy" it hits the network a second time with no variables !!!
      notifyOnNetworkStatusChange: true,
    });

  const changeDateRange = () => {
    if (state == "d") {
      setState("w");
    }
    else {
      setState("d");
    }
  };


  useEffect(() => {
    clicksFetchMore({
      variables: {
        from: 1, // irrelevant to back end but mimics my own problem
        to: 2, // likewise
        dateRange: state
      }
    })
  }, [state])


  console.log("clicks data", clicksData);

  return (
    <div>
      <p>Toggle the button to switch between states 'd' and 'w'</p>
      <p>When the state is 'w' the data returned should be the object assigned to variable userData2 on the server side... it is not</p>
      <p>State is:</p>
      <p>{state}</p>
      <p>Data returned is:</p>
      <p>{`${JSON.stringify(clicksData)}`}</p>
      <p><button onClick={changeDateRange}>Change Data</button></p>
    </div>
  );
}

const client = new ApolloClient({
  cache: new InMemoryCache({
  }),
  link
});

render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);

