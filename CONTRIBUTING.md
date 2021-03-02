# How to contribute

Thanks for taking the initiative to contribute! In participating, you are required to withhold the
[Code of Conduct](https://github.com/jeremyvii/vs-docblockr/blob/main/CODE_OF_CONDUCT.md)

## Creating issues
Please use the issue templates when creating issues. Be concise and provide has much relevant information possible. The more
relevant information provided, the quicker a bug can be fixed.

 - [Bug Template](https://github.com/jeremyvii/vs-docblockr/blob/main/.github/ISSUE_TEMPLATE/bug_report.md)
 - [Feature Request Template](https://github.com/jeremyvii/vs-docblockr/blob/main/.github/ISSUE_TEMPLATE/feature_request.md)

## Fixing issues, adding features

Don't commit to the main branch. When fixing issues or adding features, please adhere to the following:

 - Create a new branch in reference to bug or new feature
 - Adhere to the repo's coding style when adding code
 - Write comments, describe why you did what you did
 - Submit a pull request with your bug fix or new feature

## Getting started

You can view the documentation for vscode extension development
[here](https://code.visualstudio.com/api).

[nvm](https://github.com/nvm-sh/nvm) is used to keep the version of `npm`
consistent. Run the following to install the appropriate node modules.

``` shell
nvm i; npm i
```

Run `Test Extension` to run unit tests. Run `Launch Extension` to launch an
instance of the extension from your local repository.

## Coding Style

You can use reference the [TSlint configuration](https://github.com/jeremyvii/vs-docblockr/blob/main/tslint.json)
to reference full code style.
