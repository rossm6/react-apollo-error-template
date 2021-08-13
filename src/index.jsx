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



// const AggregatedDailyClicksNode = new GraphQLObjectType({
//   name: 'AggregatedDailyClicks',
//   fields: {
//     clicks: { type: GraphQLInt, resolve: (_) => { return _.clicks } },
//     date: { type: GraphQLString, resolve: (_) => { return _.date } }
//   }
// });


// const ClicksSummary = new GraphQLObjectType({
//   name: 'ClicksSummary',
//   fields: {
//     total: {
//       type: GraphQLInt,
//       resolve: (_) => {
//         return _.total;
//       }
//     }
//   }
// });


// const DateRanges = new GraphQLEnumType({
//   name: 'DateRanges',
//   values: {
//     'd': {
//       'value': '1d'
//     },
//     'w': {
//       'value': '1w'
//     }
//   }
// });



const JobNode = new GraphQLObjectType({
  name: 'JobNode',
  fields: {
    id: {
      type: GraphQLID,
      resolve: (_) => {
        return "j1"
      }
    },
    title: {
      type: GraphQLString,
      resolve: (_) => {
        return "some job"
      }
    },
  }
});


const JobEdge = new GraphQLObjectType({
  name: 'JobEdge',
  fields: {
    cursor: {
      type: GraphQLString,
      resolve: (_) => {
        "cursor"
      }
    },
    node: {
      type: JobNode,
      resolve: (_) => {

      }
    }
  }
});



const PageInfo = new GraphQLObjectType({
  name: 'PageInfo',
  fields: {
    cursor: {
      type: GraphQLString,
      resolve: (_) => {
        return _.cursor;
      }
    },
    pageNumber: {
      type: GraphQLString,
      resolve: (_) => {
        return _.pageNumber;
      }
    },
    isCurrent: {
      type: GraphQLBoolean,
      resolve: (_) => {
        return _.isCurrent;
      }
    },
  }
});


const PagesInfo = new GraphQLObjectType({
  name: 'PagesInfo',
  fields: {
    first: {
      type: PageInfo,
      resolve: (_) => {
        return _.first;
      }
    },
    last: {
      type: PageInfo,
      resolve: (_) => {
        return _.last;
      }
    },
    around: {
      type: PageInfo,
      resolve: (_) => {
        return _.around;
      }
    },
    previous: {
      type: PageInfo,
      resolve: (_) => {
        return _.previous;
      }
    }
  }
});


const JobsConnection = new GraphQLObjectType({
  name: 'JobsConnection',
  fields: {
    edges: {
      type: new GraphQLList(JobEdge),
      resolve: (_) => {
        return _.edges;
      }
    },
    pages: {
      type: PagesInfo,
      args: {
        pageSize: { type: GraphQLInt }
      },
      resolve: (_) => {
        return _.pages
      }
    }
  }
});



const AddressNode = new GraphQLObjectType({
  name: 'Address',
  fields: {
    id: {
      type: GraphQLID,
      resolve: (_) => {
        return _.id
      }
    },
    actual: {
      type: GraphQLString,
      resolve: (_) => {
        return _.actual
      }
    },
  }
});


const CreatorNode = new GraphQLObjectType({
  name: 'Creator',
  fields: {
    id: {
      type: GraphQLID,
      resolve: (_) => {
        return _.id
      }
    },
    name: {
      type: GraphQLString,
      resolve: (_) => {
        return _.name
      }
    },
    address: {
      type: AddressNode,
      resolve: (_) => {
        return _.address
      }
    },
    jobs: {
      type: JobsConnection,
      args: {
        first: { type: GraphQLInt },
        after: { type: GraphQLString },
        orderBy: { type: GraphQLString }
      },
      resolve: (_) => {
        return _.jobs
      }
    }
  }
});

const ProfileNode = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    id: {
      type: GraphQLID,
      resolve: (_) => {
        return _.id
      }
    },
    role: {
      type: GraphQLString,
      resolve: (_) => {
        return _.role
      }
    },
    creator: {
      type: CreatorNode,
      resolve: (_) => {
        return _.creator
      }
    }
  },
});


const profile1 = {
  id: "p1",
  role: 'e',
  creator: {
    id: "c1",
    pk: 1,
    name: 'dave',
    address: {
      id: "a1",
      actual: "some place"
    },
    jobs: {
      edges: [
        {
          cursor: "c1",
          node: {
            id: "n1",
            title: "title 1"
          }
        },
        {
          cursor: "c2",
          node: {
            id: "n2",
            title: "title 2"
          }
        },
      ],
      pages: {
        first: {
          cursor: "c1",
          pageNumber: 1,
          isCurrent: true
        },
        last: {
          cursor: "c3",
          pageNumber: 2,
          isCurrent: false
        },
        around: [
          {
            cursor: "c1",
            pageNumber: 1,
            isCurrent: true
          },
          {
            cursor: "c3",
            pageNumber: 2,
            isCurrent: false
          }
        ],
        previous: null
      }
    }
  }
};

const profile2 = {
  ...profile1,
  creator: {
    ...profile1.creator,
    jobs: {
      edges: [
        {
          cursor: "c3",
          node: {
            id: "n3",
            title: "title 3"
          }
        },
      ],
      pages: {
        first: {
          cursor: "c1",
          pageNumber: 1,
          isCurrent: false
        },
        last: {
          cursor: "c3",
          pageNumber: 2,
          isCurrent: true
        },
        around: [
          {
            cursor: "c1",
            pageNumber: 1,
            isCurrent: false
          },
          {
            cursor: "c3",
            pageNumber: 2,
            isCurrent: true
          }
        ],
        previous: {
          cursor: "c1",
          pageNumber: 1,
          isCurrent: false
        }
      }
    }
  }
};

let r = 0;

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    profile: {
      type: ProfileNode,
      resolve: () => {
        if(r == 0){
          return profile1
        }
        else{
          profile2
        }
      },
    },
  },
});



// const QueryType = new GraphQLObjectType({
//   name: 'Query',
//   fields: {
//     user: {
//       args: {
//         dateRange: { type: DateRanges }
//       },
//       type: UserType,
//       resolve: (_, { dateRange }) => {
//         console.log("server side date range", dateRange);
//         if (dateRange == '1d') {
//           return userData1;
//         }
//         return userData2;
//       },
//     },
//   },
// });


const schema = new GraphQLSchema({ query: QueryType });

/*** LINK ***/
import { graphql, print } from "graphql";
import { ApolloLink, Observable } from "@apollo/client";
function delay(wait) {
  return new Promise(resolve => setTimeout(resolve, wait));
}

const link = new ApolloLink(operation => {

  console.log("network request")

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
import React, { useEffect, useState, useRef } from "react";
import { render } from "react-dom";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  gql,
  useQuery,
  useMutation,
  useLazyQuery
} from "@apollo/client";
import "./index.css";




const GET_JOBS_FOR_CREATOR = gql`
  query GET_JOBS_FOR_CREATOR ($first: Int!, $after: String, $orderBy: String, $pageSize: Int!) {
    profile {
      id
      role
      creator {
        id
        name
        address {
          id
          actual
        }
        jobs (first: $first, after: $after, orderBy: $orderBy) {
          edges {
            cursor
            node {
              id
              title
            }
          }
          pages (pageSize: $pageSize) {
            first {
              cursor
              pageNumber
              isCurrent
            }
            last {
              cursor
              pageNumber
              isCurrent
            }
            around {
              cursor
              pageNumber
              isCurrent
            }
            previous {
              cursor
              pageNumber
              isCurrent
            }
          }
        }
      }
    }
  }
`;

function App() {

  const [state, setState] = useState(0);

  const [
    fetchInitial,
    {
      data,
      fetchMore,
      loading,
      called,
      client
    }
  ] = useLazyQuery(GET_JOBS_FOR_CREATOR, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  const fetchCount = useRef(0);
  if (called) {
    fetchCount.current = 1
  }

  useEffect(() => {
    if (!fetchCount.current) {
      console.log("fetch initial");
      fetchInitial({
        variables: {
          first: 2,
          after: "",
          orderBy: "",
          pageSize: 2
        }
      });
    }
    else {
      console.log("fetch more");
      fetchMore({
        variables: {
          first: 2,
          after: "c2",
          orderBy: "",
          pageSize: 2
        }
      });
    }
  }, [fetchInitial, fetchMore])


  console.log("client", client);


  return (
    <button onClick={() => setState(1)}>Fetch More</button>
  );
}

const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      CreatorNode: {
        fields: {
          jobs: {
            keyArgs: false,
            merge(existing, incoming) {
              // replace the cache with the new
              // i.e. do not cache
              console.log("incoming jobs", incoming);
              return incoming;
            },
          }
        }
      },
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

