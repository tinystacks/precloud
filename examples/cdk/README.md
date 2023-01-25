This is an example CDK package that you can use to test out `precloud check`. Here are steps to get started

```bash
# Navigate to the correct dir
cd examples/cdk;

# install dependencies
npm i;

# (Optional) initalize precloud
precloud init;

# run precloud check
precloud check;

# To see a precloud check fail, uncomment the commented out lines in examples/cdk/index.ts
precloud check;
```