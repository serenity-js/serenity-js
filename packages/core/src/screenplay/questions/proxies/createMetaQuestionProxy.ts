/* eslint-disable @typescript-eslint/ban-types */
import { formatted } from '../../../io';
import { Answerable } from '../../Answerable';
import { Question } from '../../Question';
import { MetaQuestion } from '../MetaQuestion';
import { describePath } from './describePath';
import { key } from './key';
import { PropertyPathKey } from './PropertyPathKey';

/**
 * @package
 */
export type WithPropertiesAsMetaQuestions<Original_Type, Nested_Type = Original_Type> = {
    [Key in keyof Nested_Type]: Nested_Type[Key] extends object
        ? Question<Promise<Nested_Type[Key]>> & MetaQuestion<Answerable<Original_Type>, Promise<Nested_Type[Key]>> & WithPropertiesAsMetaQuestions<Original_Type, Nested_Type[Key]>
        : Question<Promise<Nested_Type[Key]>> & MetaQuestion<Answerable<Original_Type>, Promise<Nested_Type[Key]>>
}

/**
 * @package
 */
export function createMetaQuestionProxy<Original_Type extends object>(path: PropertyPathKey[] = []): WithPropertiesAsMetaQuestions<Original_Type> {

    const empty = {};

    return new Proxy<Original_Type>(empty as any, {
        get(target: unknown, name: PropertyPathKey) {

            if (key(name).isOneOf<MetaQuestion<Answerable<Original_Type>, Promise<any>>>('of')) {

                return function of(subject: Answerable<Original_Type>) {

                    return Question.about(formatted `property ${ describePath(path) } of ${ subject }`, actor => {
                        return actor.answer(subject).then(answer => {

                            return path.reduce((subObject, keyName, index) => {
                                if (keyName in subObject) {
                                    return subObject[keyName];
                                }
                                throw new Error(formatted `property ${ describePath(path.slice(0, index + 1)) } of ${ subject } doesn't exist`);
                            }, answer);

                        });
                    });
                }
            }

            return createMetaQuestionProxy<Original_Type>(path.concat(name));
        }
    }) as WithPropertiesAsMetaQuestions<Original_Type>;
}
