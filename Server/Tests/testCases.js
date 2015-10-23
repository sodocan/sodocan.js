exports.parsePathCases = {
  '/api/sodocan': {
    searchObject: {project: 'sodocan'},
    contexts: {all:[]}
  },
  '/api/sodocan/ref/makeSkele': {
    searchObject: {project: 'sodocan', functionName: 'makeSkele'},
    contexts: {all:[]}
  },
  '/api/sodocan/examples': {
    searchObject: {project: 'sodocan'},
    contexts: {examples:[]}
  },
  '/api/sodocan/descriptions/all': {
    searchObject: {project: 'sodocan'},
    contexts: {descriptions:['all']}
  },
  '/api/sodocan/descriptions/1/10': {
    searchObject: {project: 'sodocan', functionName: 'makeSkele'},
    contexts: {descriptions:['1', '10']}
  },
  '/api/sodocan/all/all': {
    searchObject: {project: 'sodocan'},
    contexts: {all:['all','all']}
  },
  '/api/sodocan/tips/descriptions': {
    searchObject: {project: 'sodocan'},
    contexts: {tips: [], descriptions: []}
  },
  '/api/sodocan/all/tips/0': {
    searchObject: {project: 'sodocan'},
    contexts: {all: ['all'], tips: ['0']}
  },
  '/api/sodocan/ref/makeItPretty/descriptions/entryID-128/all': {
    searchObject: {project: 'sodocan', functionName: 'makeItPretty'},
    contexts: {descriptions: ['entryID-128', 'all']}
  },
  '/api/sodocan/ref/makeItPretty/descriptions/entryID-128/additionID-14': {
    searchObject: {project: 'sodocan', functionName: 'makeItPretty'},
    contexts: {descriptions: ['entryID-128', 'additionID-14']}
  }
};

exports.convertFormCase = {
  inputs: ['fishProj', {
    "functionName":"goldfish",
    "params":[{"name":"stuff","type":"Boolean"}],
    "returns":[{"type":"stuff"},{"type":"num"},{"type":"bool"}],
    "group":"happySaturday",
    "classContext":"",
    "index":0,
    "explanations":{
      "descriptions":"xtra cheddar",
      "examples":"",
      "tips":""
    }
  }],
  expectedOutput: {
    "project":"fishProj",
    "functionName":"goldfish",
    "group":"happySaturday",
    "reference": {
      "params": [{"name":"stuff","type":"Boolean"}],
      "returns":[{"type":"stuff"},{"type":"num"},{"type":"bool"}]
    },
    "explanations": {
      "descriptions": [{
        "text": "xtra cheddar",
        "upvotes": 0,
        "additions": [],
        "entryID": 837662812
      }],
      "examples": [],
      "tips": []
    }
  }
};
// {
//     project: projectName,
//     functionName: skeleObj.functionName,
//     group: skeleObj.group,
//     reference: {
//       params: skeleObj.params,
//       returns: skeleObj.returns
//     },
//     explanations: explanations
//   };

exports.parserPostCases = [
  {
    header: {project: 'testProj'},
    body: [
      {
        functionName: 'method1',
        group: 'testGroup',
        params: [],
        returns: [],
        explanations: {
          descriptions: 'descriptionblahblah',
          examples: 'examplesblahblah',
          tips: 'tipsblahblah'
        }
      },
      {
        functionName: 'method2',
        group: 'testGroup',
        params: [],
        returns: [],
        explanations: {
          descriptions: 'descriptionblahblah2',
          examples: 'examplesblahblah2',
          tips: 'tipsblahblah2'
        }
      }
    ]
  },
  {
    header: {project: 'testProj'},
    body: [
      {
        functionName: 'method1',
        group: 'testGroup',
        params: [],
        returns: [],
        explanations: {
          descriptions: 'descriptionblahblah',
          examples: 'examplesblahblah',
          tips: 'tipsblahblah'
        }
      },
      {
        functionName: 'method2',
        group: 'testGroup',
        params: [],
        returns: [],
        explanations: {
          descriptions: '',
          examples: 'examplesblahblah2_modified',
          tips: 'tipsblahblah2'
        }
      }
    ]
  },
  {
    header: {project: 'testProj'},
    body: [
      {
        functionName: 'method3',
        group: 'testGroup',
        params: [],
        returns: [],
        explanations: {
          descriptions: '',
          examples: '',
          tips: ''
        }
      }
    ]
  }
];

exports.parserPostExpectedReturns = [
  [ // Number 1
    {
      "_id": "5629a44fa0e915de15f8b8a4",
      "project": "testProj",
      "functionName": "method1",
      "group": "testGroup",
      "reference": {
        "params": [],
        "returns": []
      },
      "explanations": {
        "descriptions": [
          {
            "text": "descriptionblahblah",
            "upvotes": 0,
            "additions": [],
            "entryID": 1294058334
          }
        ],
        "examples": [
          {
            "text": "examplesblahblah",
            "upvotes": 0,
            "additions": [],
            "entryID": 719765163
          }
        ],
        "tips": [
          {
            "text": "tipsblahblah",
            "upvotes": 0,
            "additions": [],
            "entryID": 907176294
          }
        ]
      },
      "__v": 0
    },
    {
      "_id": "5629a44fa0e915de15f8b8a5",
      "project": "testProj",
      "functionName": "method2",
      "group": "testGroup",
      "reference": {
        "params": [],
        "returns": []
      },
      "explanations": {
        "descriptions": [
          {
            "text": "descriptionblahblah2",
            "upvotes": 0,
            "additions": [],
            "entryID": 1461102740
          }
        ],
        "examples": [
          {
            "text": "examplesblahblah2",
            "upvotes": 0,
            "additions": [],
            "entryID": 837883623
          }
        ],
        "tips": [
          {
            "text": "tipsblahblah2",
            "upvotes": 0,
            "additions": [],
            "entryID": 1942306008
          }
        ]
      },
      "__v": 0
    }
  ],
  [ // Number 2
    {
      "_id": "5629a44fa0e915de15f8b8a4",
      "project": "testProj",
      "functionName": "method1",
      "group": "testGroup",
      "reference": {
        "params": [],
        "returns": []
      },
      "explanations": {
        "descriptions": [
          {
            "text": "descriptionblahblah",
            "upvotes": 0,
            "additions": [],
            "entryID": 1294058334
          }
        ],
        "examples": [
          {
            "text": "examplesblahblah",
            "upvotes": 0,
            "additions": [],
            "entryID": 719765163
          }
        ],
        "tips": [
          {
            "text": "tipsblahblah",
            "upvotes": 0,
            "additions": [],
            "entryID": 907176294
          }
        ]
      },
      "__v": 0
    },
    {
      "_id": "5629a44fa0e915de15f8b8a5",
      "project": "testProj",
      "functionName": "method2",
      "group": "testGroup",
      "reference": {
        "params": [],
        "returns": []
      },
      "explanations": {
        "descriptions": [
          {
            "text": "descriptionblahblah2",
            "upvotes": 0,
            "additions": [],
            "entryID": 1461102740
          }
        ],
        "examples": [
          {
            "text": "examplesblahblah2",
            "upvotes": 0,
            "additions": [],
            "entryID": 837883623
          },
          {
            "entryID": 199356705,
            "additions": [],
            "upvotes": 0,
            "text": "examplesblahblah2_modified"
          }
        ],
        "tips": [
          {
            "text": "tipsblahblah2",
            "upvotes": 0,
            "additions": [],
            "entryID": 1942306008
          }
        ]
      },
      "__v": 0
    }
  ],
  [ // Number 3
    {
      "_id": "5629a44fa0e915de15f8b8a4",
      "project": "testProj",
      "functionName": "method1",
      "group": "testGroup",
      "reference": {
        "params": [],
        "returns": []
      },
      "explanations": {
        "descriptions": [
          {
            "text": "descriptionblahblah",
            "upvotes": 0,
            "additions": [],
            "entryID": 1294058334
          }
        ],
        "examples": [
          {
            "text": "examplesblahblah",
            "upvotes": 0,
            "additions": [],
            "entryID": 719765163
          }
        ],
        "tips": [
          {
            "text": "tipsblahblah",
            "upvotes": 0,
            "additions": [],
            "entryID": 907176294
          }
        ]
      },
      "__v": 0
    },
    {
      "_id": "5629a44fa0e915de15f8b8a5",
      "project": "testProj",
      "functionName": "method2",
      "group": "testGroup",
      "reference": {
        "params": [],
        "returns": []
      },
      "explanations": {
        "descriptions": [
          {
            "text": "descriptionblahblah2",
            "upvotes": 0,
            "additions": [],
            "entryID": 1461102740
          }
        ],
        "examples": [
          {
            "text": "examplesblahblah2",
            "upvotes": 0,
            "additions": [],
            "entryID": 837883623
          },
          {
            "entryID": 199356705,
            "additions": [],
            "upvotes": 0,
            "text": "examplesblahblah2_modified"
          }
        ],
        "tips": [
          {
            "text": "tipsblahblah2",
            "upvotes": 0,
            "additions": [],
            "entryID": 1942306008
          }
        ]
      },
      "__v": 0
    },
    {
      "_id": "5629a58cd87a67741639098f",
      "project": "testProj",
      "functionName": "method3",
      "group": "testGroup",
      "reference": {
        "params": [],
        "returns": []
      },
      "explanations": {
        "descriptions": [],
        "examples": [],
        "tips": []
      },
      "__v": 0
    }
  ]
];




exports.getValidCases = {
  '/api/testProj': {
    searchObject: {project: 'testProj'},
    contexts: {all:[]}
  },
  '/api/sodocan/ref/makeSkele': {
    searchObject: {project: 'sodocan', functionName: 'makeSkele'},
    contexts: {all:[]}
  },
  '/api/sodocan/examples': {
    searchObject: {project: 'sodocan'},
    contexts: {examples:[]}
  },
  '/api/sodocan/descriptions/all': {
    searchObject: {project: 'sodocan'},
    contexts: {descriptions:['all']}
  },
  '/api/sodocan/descriptions/1/10': {
    searchObject: {project: 'sodocan', functionName: 'makeSkele'},
    contexts: {descriptions:['1', '10']}
  },
  '/api/sodocan/all/all': {
    searchObject: {project: 'sodocan'},
    contexts: {all:['all','all']}
  },
  '/api/sodocan/tips/descriptions': {
    searchObject: {project: 'sodocan'},
    contexts: {tips: [], descriptions: []}
  },
  '/api/sodocan/all/tips/0': {
    searchObject: {project: 'sodocan'},
    contexts: {all: ['all'], tips: ['0']}
  },
  '/api/sodocan/ref/makeItPretty/descriptions/entryID-128/all': {
    searchObject: {project: 'sodocan', functionName: 'makeItPretty'},
    contexts: {descriptions: ['entryID-128', 'all']}
  },
  '/api/sodocan/ref/makeItPretty/descriptions/entryID-128/additionID-14': {
    searchObject: {project: 'sodocan', functionName: 'makeItPretty'},
    contexts: {descriptions: ['entryID-128', 'additionID-14']}
  }
};