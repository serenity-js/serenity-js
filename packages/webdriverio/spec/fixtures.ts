import { minify } from 'html-minifier';

export function pageFromTemplate(template: string): string {
    return `data:text/html;charset=utf-8,${ minify(`<!DOCTYPE html>${ template }`, {
        collapseWhitespace: true,
        removeComments: true,
        preserveLineBreaks: false,
        keepClosingSlash: true,
    }) }`;
}
