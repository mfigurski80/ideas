import { Injectable, PipeTransform, ArgumentMetadata, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';


@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value:any, metadata:ArgumentMetadata) {

    if (value instanceof Object && this.isEmpty(value)) {// if empty object
      throw new HttpException(
        `Validation Failed: No body submitted`,
        HttpStatus.BAD_REQUEST
      );
    }

    const { metatype } = metadata;
    if (!metatype || !this.toValidate(metatype)) return value; // if no metatype

    const object = plainToClass(metatype, value);
    const errors = await validate(object); // actually validate
    if (errors.length > 0) {
      throw new HttpException(
        `Validation Failed: ${this.formatErrors(errors)}`,
        HttpStatus.BAD_REQUEST
      );
    }
    return value;
  }

  private toValidate(metatype):boolean {
    const types:any = [String, Boolean, Number, Array, Object];
    return !types.find(type => metatype === type);
  }

  private formatErrors(errors:Array<any>):string {
    return errors.map(err => {
      for (let property in err.constraints) {
        return err.constraints[property];
      }
    }).join(',');
  }

  private isEmpty(value:any):boolean {
    if (Object.keys(value).length > 0) return false;
    return true;
  }
}
