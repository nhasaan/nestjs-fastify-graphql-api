import { DynamicModule, Module as NestModule, Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';

export interface ModuleOptions
  extends Pick<
    ModuleMetadata,
    'imports' | 'providers' | 'controllers' | 'exports'
  > {
  global?: boolean;
}

export function Module(metadata: ModuleOptions): ClassDecorator {
  return <TFunction extends Function>(target: TFunction): TFunction | void => {
    const { global = false, ...rest } = metadata;
    if (global) {
      NestModule({ global: true, ...rest })(target);
    } else {
      NestModule(rest)(target);
    }
    return target;
  };
}
