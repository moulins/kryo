import {runTests, TypedValue} from "../test/test";
import {StringType} from "./string";

describe("StringType", function () {
  const type: StringType = new StringType();

  const items: TypedValue[] = [
    // Valid items
    {name: '""', value: "", valid: true},
    {name: '"Hello World!"', value: "Hello World!", valid: true},
    {name: "Drop the bass", value: "ԂЯØǷ Łƕ੬ ɃɅϨϞ", valid: true},
    // Invalid items
    {name: 'new String("stringObject")', value: new String("stringObject"), valid: false},
    {name: "0.5", value: 0.5, valid: false},
    {name: "0.0001", value: 0.0001, valid: false},
    {name: "Infinity", value: Infinity, valid: false},
    {name: "-Infinity", value: -Infinity, valid: false},
    {name: "NaN", value: NaN, valid: false},
    {name: "undefined", value: undefined, valid: false},
    {name: "null", value: null, valid: false},
    {name: "true", value: true, valid: false},
    {name: "false", value: false, valid: false},
    {name: "[]", value: [], valid: false},
    {name: "{}", value: {}, valid: false},
    {name: "new Date()", value: new Date(), valid: false},
    {name: "/regex/", value: /regex/, valid: false}
  ];

  runTests(type, items);

  //
  // runTestSync(type, falsyItems);
  //
  // describe ("options.lowerCase", function () {
  //   let typeLowerCase = new StringTypeSync({lowerCase: true});
  //   let items: RunTestItem[] = [
  //     {name: "abc", value: "abc", message: null},
  //     {name: "ABC", value: "ABC", message: ""},
  //     {name: "Abc", value: "Abc", message: ""},
  //     {name: "aBc", value: "aBc", message: ""}
  //   ];
  //   runTestSync(typeLowerCase, items);
  //
  //   describe ("override to true", function() {
  //     runTestSync(type, [
  //       {name: "abc", value: "abc", message: null, options: {lowerCase: true}},
  //       {name: "Abc", value: "Abc", message: "", options: {lowerCase: true}}
  //     ]);
  //   });
  //
  //   describe ("override to false", function() {
  //     runTestSync(typeLowerCase, [
  //       {name: "abc", value: "abc", message: null, options: {lowerCase: false}},
  //       {name: "Abc", value: "Abc", message: null, options: {lowerCase: false}}
  //     ]);
  //   });
  //
  // });
});
