import * as bodyParser from 'body-parser';
import * as express from 'express';
import { match } from 'tiny-types';

import { CalculationId, Calculator, EnterOperandCommand, GetCalculationResult, Operand, Operator, UseOperatorCommand } from '../';
import { Expression } from './model';

export function controllers(api: express.Application, calculator: Calculator) {

    // curl -X POST -H "Content-Type: text/plain" --data "2+2" http://localhost:3000/api/calculations
    api.post('/api/calculations', bodyParser.text(), (request: express.Request, response: express.Response) => {

        const
            calculation = Expression.fromString(request.body),
            calculationId = CalculationId.create();

        calculation.tokens.forEach(token => match<Operand | Operator, void>(token)
            .when(Operator, (_: Operator) => calculator.execute(new UseOperatorCommand(_, calculationId)))
            .when(Operand,  (_: Operand) => calculator.execute(new EnterOperandCommand(_, calculationId)))
            .else(_ => void 0),
        );

        response.status(201).location(`/api/calculations/${ calculationId.value }`).send();
    });

    api.get('/api/calculations/:calculation_id', (request: express.Request, response: express.Response) => {

        const
            calculationId = new CalculationId(request.params.calculation_id),
            query = new GetCalculationResult(calculationId);

        const result = calculator.submit(query);

        response.status(200).send({
            result,
        });
    });

    return api;
}
