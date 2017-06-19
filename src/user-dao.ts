import * as mongo from 'mongodb';
import {database} from './database';
import {log} from '../logger/logger';
import {CreateResponse, DatabaseResponse} from './database-response.model';
import {dao} from './dao';
import {passwordCryptographer} from '../auth/password-cryptographer';
import {User} from './user.model';
import {utils} from '../utils/utils';

export namespace userDAO {

  export function create(user: User, password: string, cb: (dbResponse: DatabaseResponse<CreateResponse>) => void) {

    const userCopy = utils.deepCopyData(user);

    dao.readOneByField('email', userCopy.email, 'users', (dbResp) => {

      /**
       * Condition to create a new is user is no user with this email exists.
       * This means if NO user is found, go ahead and create it.
       */
      if (!dbResp.data) {
        passwordCryptographer.doHash(password).then((hash: string) => {
          userCopy.password = hash;
          dao.create(userCopy, 'users', cb);
        }, (err) => {
          log.error(err);
          return cb({
            error: {
              message: 'Problem during hashing'
            }
          });
        });

      } else {
        // if a user with this email exists, deny creation
        return cb({
          error: {
            message: 'User already exists'
          }
        });
      }
    });

  }

  export function getByMail(email: string, cb: (dbResponse: DatabaseResponse<any>) => void) {
    dao.readOneByField('email', email, 'Users', cb);
  }


  export function getById(id: string, cb: (dbResponse: DatabaseResponse<any>) => void) {
    dao.read(id, 'Users', cb);
  }

}
