import app from './app';
import { config } from './lib/config';

const port = config.port;

app.listen(port, () => {
  console.log(`Noah API listening on port ${port}`);
});
