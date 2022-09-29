import {parseSyml} from '@yarnpkg/parsers';

import {joinYaml}  from './utils';

// TODO: Update the terminology used in this file to match the way it's used in the YAML spec.

describe(`Syml parser`, () => {
  // TODO: Check the error messages.
  describe(`Duplicate mapping entries`, () => {
    it(`should throw on duplicate entries in flow mappings`, () => {
      expect(() => parseSyml(`{foo: bar, foo: baz}`)).toThrow();
    });

    it(`should throw on duplicate entries in compact block mappings`, () => {
      expect(() => parseSyml(joinYaml([
        `foo: bar`,
        `foo: baz`,
      ]))).toThrow();
    });

    it(`should throw on duplicate entries in block mappings`, () => {
      expect(() => parseSyml(joinYaml([
        `foo:`,
        `  bar: baz`,
        `  bar: qux`,
      ]))).toThrow();
    });
  });

  describe(`Non-values`, () => {
    it(`should parse empty strings as an empty object`, () => {
      expect(parseSyml(``)).toStrictEqual({});
    });

    it(`should parse whitespace-only strings as an empty object`, () => {
      expect(parseSyml(`\n \t \n`)).toStrictEqual({});
    });
  });

  it(`should parse plain scalars`, () => {
    expect(parseSyml(`foo`)).toStrictEqual(`foo`);
  });

  it(`should parse double quoted scalars`, () => {
    expect(parseSyml(`"foo"`)).toStrictEqual(`foo`);
  });

  it(`should parse empty double quoted scalars`, () => {
    expect(parseSyml(`""`)).toStrictEqual(``);
  });

  it(`should parse single quoted scalars`, () => {
    expect(parseSyml(`'foo'`)).toStrictEqual(`foo`);
  });

  it(`should parse empty single quoted scalars`, () => {
    expect(parseSyml(`''`)).toStrictEqual(``);
  });

  it(`should parse empty flow sequences`, () => {
    expect(parseSyml(`[]`)).toStrictEqual([]);
  });

  it(`should parse flow sequences with plain scalar items`, () => {
    expect(parseSyml(`[foo]`)).toStrictEqual([`foo`]);
    expect(parseSyml(`[foo, bar]`)).toStrictEqual([`foo`, `bar`]);
  });

  it(`should parse flow sequences with double quoted scalar items`, () => {
    expect(parseSyml(`["foo"]`)).toStrictEqual([`foo`]);
    expect(parseSyml(`["foo", "bar"]`)).toStrictEqual([`foo`, `bar`]);
  });

  it(`should parse flow sequences with single quoted scalar items`, () => {
    expect(parseSyml(`['foo']`)).toStrictEqual([`foo`]);
    expect(parseSyml(`['foo', 'bar']`)).toStrictEqual([`foo`, `bar`]);
  });

  it(`should parse flow sequences with mixed scalar items`, () => {
    expect(parseSyml(`[foo, "bar", 'baz']`)).toStrictEqual([`foo`, `bar`, `baz`]);
  });

  it(`should parse flow sequences with flow sequence items`, () => {
    expect(parseSyml(`[[foo]]`)).toStrictEqual([[`foo`]]);
    expect(parseSyml(`[[[foo]]]`)).toStrictEqual([[[`foo`]]]);
    expect(parseSyml(`[[foo, bar], [baz]]`)).toStrictEqual([[`foo`, `bar`], [`baz`]]);
  });

  it(`should parse flow sequences with flow mapping items`, () => {
    expect(parseSyml(`[{foo: bar}]`)).toStrictEqual([{foo: `bar`}]);
    expect(parseSyml(`[{foo: bar}, {baz: qux}]`)).toStrictEqual([{foo: `bar`}, {baz: `qux`}]);
  });

  it(`should parse flow sequences with compact flow mapping items`, () => {
    expect(parseSyml(`[foo: bar]`)).toStrictEqual([{foo: `bar`}]);
    expect(parseSyml(`[foo: bar, baz: qux]`)).toStrictEqual([{foo: `bar`}, {baz: `qux`}]);
  });

  it(`should allow whitespace inside flow sequences`, () => {
    expect(parseSyml(joinYaml([
      `[  `,
      `     ]`,
    ]))).toStrictEqual([]);

    expect(parseSyml(joinYaml([
      `[   \t `,
      `     foo  \t  `,
      ` \t ,  \t `,
      `   \t  bar  \t `,
      ` \t ]`,
    ]))).toStrictEqual([`foo`, `bar`]);
  });

  it(`should allow trailing commas inside flow sequences`, () => {
    expect(parseSyml(joinYaml([
      `[`,
      `  foo,`,
      `  bar,`,
      `]`,
    ]))).toStrictEqual([`foo`, `bar`]);
  });

  it(`should parse empty flow mappings`, () => {
    expect(parseSyml(`{}`)).toStrictEqual({});
  });

  it(`should parse flow mappings with plain scalar entries`, () => {
    expect(parseSyml(`{foo: bar}`)).toStrictEqual({foo: `bar`});
    expect(parseSyml(`{foo: bar, baz: qux}`)).toStrictEqual({foo: `bar`, baz: `qux`});
  });

  it(`should parse flow mappings with double quoted scalar entries`, () => {
    expect(parseSyml(`{"foo": "bar"}`)).toStrictEqual({foo: `bar`});
    expect(parseSyml(`{"foo": "bar", "baz": "qux"}`)).toStrictEqual({foo: `bar`, baz: `qux`});
  });

  it(`should parse flow mappings with single quoted scalar entries`, () => {
    expect(parseSyml(`{'foo': 'bar'}`)).toStrictEqual({foo: `bar`});
    expect(parseSyml(`{'foo': 'bar', 'baz': 'qux'}`)).toStrictEqual({foo: `bar`, baz: `qux`});
  });

  it(`should parse flow mappings with flow mapping entries`, () => {
    expect(parseSyml(`{ foo: { bar: a } }`)).toStrictEqual({foo: {bar: `a`}});
    expect(parseSyml(`{ foo: { bar: { baz: a } } }`)).toStrictEqual({foo: {bar: {baz: `a`}}});
    expect(parseSyml(`{ foo: { bar: a }, baz: { qux: b } }`)).toStrictEqual({foo: {bar: `a`}, baz: {qux: `b`}});
  });

  it(`should parse flow mappings with flow sequence entries`, () => {
    expect(parseSyml(`{foo: [bar], baz: [qux]}`)).toStrictEqual({foo: [`bar`], baz: [`qux`]});
  });

  it(`should allow whitespace inside flow mappings`, () => {
    expect(parseSyml(joinYaml([
      `{  `,
      `     }`,
    ]))).toStrictEqual({});

    expect(parseSyml(joinYaml([
      `{   \t `,
      `     foo:  \t  bar  \t  `,
      ` \t ,  \t `,
      `   \t  baz: qux  \t `,
      ` \t }`,
    ]))).toStrictEqual({foo: `bar`, baz: `qux`});
  });

  it(`should allow trailing commas inside flow mappings`, () => {
    expect(parseSyml(joinYaml([
      `{`,
      `  foo: bar,`,
      `  baz: qux,`,
      `}`,
    ]))).toStrictEqual({foo: `bar`, baz: `qux`});
  });

  it(`should parse block sequences`, () => {
    expect(parseSyml(joinYaml([
      `- foo`,
    ]))).toStrictEqual([`foo`]);

    expect(parseSyml(joinYaml([
      `- foo`,
      `- bar`,
    ]))).toStrictEqual([`foo`, `bar`]);
  });

  it(`should parse compact block mappings`, () => {
    expect(parseSyml(joinYaml([
      `foo: bar`,
    ]))).toStrictEqual({foo: `bar`});

    expect(parseSyml(joinYaml([
      `foo: bar`,
      `baz: qux`,
    ]))).toStrictEqual({foo: `bar`, baz: `qux`});
  });

  it(`should parse block mappings`, () => {
    expect(parseSyml(joinYaml([
      `foo:`,
      `  bar: baz`,
    ]))).toStrictEqual({foo: {bar: `baz`}});

    expect(parseSyml(joinYaml([
      `foo:`,
      `  bar: baz`,
      `  a: b`,
    ]))).toStrictEqual({foo: {bar: `baz`, a: `b`}});
  });

  it(`should parse block mappings containing block sequences`, () => {
    expect(parseSyml(joinYaml([
      `foo:`,
      `  - bar`,
    ]))).toStrictEqual({foo: [`bar`]});

    expect(parseSyml(joinYaml([
      `foo:`,
      `  - bar`,
      `  - baz`,
    ]))).toStrictEqual({foo: [`bar`, `baz`]});
  });
});
