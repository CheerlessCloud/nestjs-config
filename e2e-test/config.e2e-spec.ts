/* eslint-disable max-classes-per-file */
import * as path from 'path';
import * as fs from 'fs';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Config, ConfigModule, Env } from '../src';
import { TestModule } from './fixtures/test.module';
import { Boolean, Integer, Number, String } from '../src/types';

describe('Config', () => {
  @Config('TEST')
  class TestConfig {
    @Env('STRING_VAR')
    @String()
    stringVar: string;

    @Env('STRING_VAR_WITH_DEFAULT')
    @String()
    stringVarWithDefault = 'default';

    @Env('INT_VAR')
    @Integer()
    intVar: number;

    @Env('INT_VAR_WITH_DEFAULT')
    @Integer()
    intVarWithDefault = 0;

    @Env('NUMBER_VAR')
    @Number()
    numberVar: number;

    @Env('NUMBER_VAR_WITH_DEFAULT')
    @Number()
    numberVarWithDefault = 3.33;

    @Env('BOOL_VAR')
    @Boolean()
    boolVar: boolean;

    @Env('BOOL_VAR_WITH_DEFAULT')
    @Boolean()
    boolVarWithDefault = false;
  }

  let envFilePath: string;
  beforeEach(() => {
    envFilePath = path.join(
      __dirname,
      'fixtures',
      `.env.test_${Math.random().toString()}`,
    );
    fs.writeFileSync(envFilePath, '');
  });

  afterEach(() => {
    fs.unlinkSync(envFilePath);
  });

  it('default', async () => {
    @Module({
      imports: [
        ConfigModule.forRoot({ path: envFilePath }),
        TestModule.forFeature(TestConfig),
      ],
    })
    class AppModule {}

    const app = await NestFactory.createApplicationContext(AppModule);
    const config = app.get<TestConfig>(TestConfig);
    expect(config).toMatchObject({
      stringVarWithDefault: 'default',
      intVarWithDefault: 0,
      numberVarWithDefault: 3.33,
      boolVarWithDefault: false,
    });
    await app.close();
  });

  it('override', async () => {
    fs.writeFileSync(
      envFilePath,
      `TEST__STRING_VAR=stringVar
      TEST__STRING_VAR_WITH_DEFAULT=stringVarWithDefault
      TEST__INT_VAR=1
      TEST__INT_VAR_WITH_DEFAULT=7
      TEST__NUMBER_VAR=1.1
      TEST__NUMBER_VAR_WITH_DEFAULT=7.7
      TEST__BOOL_VAR=true
      TEST__BOOL_VAR_WITH_DEFAULT=true`,
    );

    @Module({
      imports: [
        ConfigModule.forRoot({ path: envFilePath }),
        TestModule.forFeature(TestConfig),
      ],
    })
    class AppModule {}

    const app = await NestFactory.createApplicationContext(AppModule);
    const config = app.get<TestConfig>(TestConfig);
    expect(config).toMatchObject({
      stringVar: 'stringVar',
      stringVarWithDefault: 'stringVarWithDefault',
      intVar: 1,
      intVarWithDefault: 7,
      numberVar: 1.1,
      numberVarWithDefault: 7.7,
      boolVar: true,
      boolVarWithDefault: true,
    });
    await app.close();
  });
});
