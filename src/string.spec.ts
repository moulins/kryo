import {StringTypeSync} from "./string";
import {RunTestItem, runTestSync} from "./helpers/test";

describe("StringType", function () {

  let type: StringTypeSync = new StringTypeSync();

  let truthyItems: RunTestItem[] = [
    {name: '""', value: "", message: null},
    {name: '"Hello World!"', value: "Hello World!", message: null}
  ];

  runTestSync(type, truthyItems);

  let falsyItems: RunTestItem[] = [
    {name: 'new String("stringObject")', value: new String("stringObject"), message: ""},
    {name: "0.5", value: 0.5, message: ""},
    {name: "0.0001", value: 0.0001, message: ""},
    {name: "Infinity", value: Infinity, message: ""},
    {name: "-Infinity", value: -Infinity, message: ""},
    {name: "NaN", value: NaN, message: ""},
    {name: "undefined", value: undefined, message: ""},
    {name: "null", value: null, message: ""},
    {name: "[]", value: [], message: ""},
    {name: "{}", value: {}, message: ""},
    {name: "/regex/", value: /regex/, message: ""}
  ];

  runTestSync(type, falsyItems);

  describe ("options.lowerCase", function () {
    let typeLowerCase = new StringTypeSync({lowerCase: true});
    let items: RunTestItem[] = [
      {name: "abc", value: "abc", message: null},
      {name: "ABC", value: "ABC", message: ""},
      {name: "Abc", value: "Abc", message: ""},
      {name: "aBc", value: "aBc", message: ""}
    ];
    runTestSync(typeLowerCase, items);

    describe ("override to true", function() {
      runTestSync(type, [
        {name: "abc", value: "abc", message: null, options: {lowerCase: true}},
        {name: "Abc", value: "Abc", message: "", options: {lowerCase: true}}
      ]);
    });

    describe ("override to false", function() {
      runTestSync(typeLowerCase, [
        {name: "abc", value: "abc", message: null, options: {lowerCase: false}},
        {name: "Abc", value: "Abc", message: null, options: {lowerCase: false}}
      ]);
    });

  });
});
