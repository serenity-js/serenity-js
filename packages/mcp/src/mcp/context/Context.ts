export class Context {
    // todo: load env variables upon initialization

    // todo: expose method to run a command and return:
    //   "success": true,
    //   "exitCode": 0,
    //   "stdout": "...",
    //   "stderr": "...",
    //   "error": null,
    //   "timestamp": "2025-09-13T12:34:56Z",
    //   "changedFiles": [
    //       {
    //           "path": "package.json",
    //           "diff": "...",         // (optional) unified diff or summary of changes
    //           "content": "..."       // (optional) new file content
    //       },
    // //

    async close(): Promise<void> {

    }
}
