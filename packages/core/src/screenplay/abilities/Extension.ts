/**
 * @experimental
 */
export interface Extension<Subject> {
    applyTo(subject: Subject): Promise<Subject> | Subject;
}
