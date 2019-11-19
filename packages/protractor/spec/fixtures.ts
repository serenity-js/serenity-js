import { minify } from 'html-minifier';
import { by } from 'protractor';
import { Target } from '../src/screenplay/questions/targets';

export function pageFromTemplate(template: string): string {
    return `data:text/html;charset=utf-8,${ minify(`<!DOCTYPE html>${ template }`, {
        collapseWhitespace: true,
        removeComments: true,
        preserveLineBreaks: false,
        keepClosingSlash: true,
    }) }`;
}
