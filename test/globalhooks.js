export const before = () => {
  global.chrome = global.preChrome;
  //global.window = sinon.stub();
}

export const after = () => {
  delete global.chrome;
  //delete global.window;
}
