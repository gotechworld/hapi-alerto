[![SonarCloud](https://sonarcloud.io/images/project_badges/sonarcloud-white.svg)](https://sonarcloud.io/summary/new_code?id=petrugiurca_hapi-alerto)

# Hapi - Alerto

Will help the node js services to alert the logs collector app in order to report the failures

### Getting Started

Make sure you have a project created on our [logs app](https://sentry.io/organizations/axsys/projects)

## Installing

First step is to register Hapi - Alerto on manifest file.

The following options are available:

    - dsn (where the logs will be pushed, can be found on the project created earlier)
    - releaseFile (path to the release file, file from which Hapi - Alerto will extract info such as version)

Example:

```
{
  "plugin": "hapi-alerto",
  "options": {
    "dsn": "https://ae6e3a30f52445cb88282aef8756d115@sentry.io/1523836",
    "releaseFile": "release.txt"
  }
}
```

That's it!

From now on Hapi - Alerto will make sure that errors will reach its destination.

However, if you want to inject an alert anywhere in your project you can use our exposed methods, such as:
* captureEvent
* captureMessage
* captureException
* configureScope

Example:

```
server.methods.captureMessage('message to capture');
```

For further clarifications you can check out [Sentry doc](https://docs.sentry.io)
