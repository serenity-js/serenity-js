/* eslint-disable @typescript-eslint/ban-types */
import { formatted } from '../../../io';
import { Answerable } from '../../Answerable';
import { Question } from '../../Question';
import { describePath } from './describePath';
import { key } from './key';
import { PropertyPathKey } from './PropertyPathKey';

/**
 * @package
 */
export type WithPropertiesAsQuestions<Original_Type> = {
    [Key in keyof Original_Type]: Original_Type[Key] extends object
        ? Question<Promise<Original_Type[Key]>> & WithPropertiesAsQuestions<Original_Type[Key]>
        : Question<Promise<Original_Type[Key]>>
}

/**
 * @package
 */
export function createQuestionProxy<Original_Type extends object>(subject: Answerable<Original_Type>, path: PropertyPathKey[] = []): WithPropertiesAsQuestions<Original_Type> {

    const empty = {};

    return new Proxy<Original_Type>(empty as any, {
        get(target: unknown, name: PropertyPathKey) {

            if (key(name).isOneOf<Question<any>>('answeredBy', 'describedAs', 'map', 'toString')) {

                const question = Question.about(formatted `property ${ describePath(path) } of ${ subject }`, actor => {
                    return actor.answer(subject).then(answer => {

                        return path.reduce((subObject, keyName, index) => {
                            if (keyName in subObject) {
                                return subObject[keyName];
                            }
                            throw new Error(formatted `property ${ describePath(path.slice(0, index + 1)) } of ${ subject } doesn't exist`);
                        }, answer);

                    })
                });

                return question[name].bind(question);
            }

            return createQuestionProxy(subject, path.concat(name));
        }
    }) as WithPropertiesAsQuestions<Original_Type>;
}
