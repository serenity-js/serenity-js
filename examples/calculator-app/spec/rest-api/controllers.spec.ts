// todo
// import 'mocha';
//
// import * as express from 'express';
// import * as sinon from 'sinon';
// import * as supertest from 'supertest';
//
// import { Calculator, Operator } from '../../src';
// import { controllers } from '../../src/rest-api/controllers';
//
// import { expect } from '../expect';
//
// describe('REST API', () => {
//
//     const
//         calculator = sinon.createStubInstance(Calculator),
//         server = controllers(express(), calculator as any);
//
//     // given([
//     //     { description: '+', expected: new AdditionOperator() },
//     //     { description: '/', expected: new DivisionOperator() },
//     //     { description: '(', expected: new LeftParenthesisOperator() },
//     //     { description: ')', expected: new RightParenthesisOperator() },
//     //     { description: '-', expected: new SubtractionOperator() },
//     // ]).
//     it('transforms the HTTP request into a series of Commands for the Calculator to execute', () =>
//         supertest(server)
//             .post('/api/calculations')
//             .set('Content-Type', 'text/plain')
//             .send('2 + 2')
//             .expect(201)
//             .then(res => {
//
//                 expect(calculator.execute).to.have.been.calledWith(1);
//             }));
//     // https://softwareengineering.stackexchange.com/questions/171122/proper-response-for-a-rest-insert-full-new-record-or-just-the-record-id-value
// });
