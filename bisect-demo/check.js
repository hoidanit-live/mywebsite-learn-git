import { add } from './math.js';

const result = add(2, 3);

if (result === 5) {
  console.log('OK: add(2,3) =', result);
  process.exit(0);
} else {
  console.log('BUG: add(2,3) =', result, '(expected 5)');
  process.exit(1);
}
