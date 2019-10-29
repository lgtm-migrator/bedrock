import * as TestError from './TestError';
import * as LoggedError from './LoggedError';
import * as Differ from './Differ';
import { htmlentities } from './StringUtils';

type LoggedError = LoggedError.LoggedError;

type AssertionError = TestError.AssertionError;
type HtmlDiffAssertionError = TestError.HtmlDiffAssertionError;
type TestError = TestError.TestError;
type PprintAssertionError = TestError.PprintAssertionError;

/* Required to make <del> and <ins> stay as tags.*/
const processQUnit = (html: string): string =>
  (html
    .replace(/&lt;del&gt;/g, '<del>')
    .replace(/&lt;\/del&gt;/g, '</del>')
    .replace(/&lt;ins&gt;/g, '<ins>')
    .replace(/&lt;\/ins&gt;/g, '</ins>'));

const formatExtra = (e: LoggedError): string => {
  if (!e.logs) {
    if (e.error && e.error.stack) {
      const lines = e.error.stack.split('\n').filter((line) =>
        line.indexOf('at') !== -1);
      return '\n\nStack:\n' + lines.join('\n');
    } else {
      return '';
    }
  } else {
    const lines = e.logs.map((log) =>
      log.replace(/\n/g, '\\n').replace(/\r/g, '\\r'));
    return '\n\nLogs:\n' + lines.join('\n');
  }
};

export const html = (err: LoggedError): string => {
  const e = err === undefined ? new Error('no error given') : err.error;
  const extra = formatExtra(err);

  if (TestError.isHTMLDiffError(e)) {
    // Provide detailed HTML comparison information
    return 'Test failure: ' + e.message +
      '\nExpected: ' + htmlentities(e.diff.expected) +
      '\nActual: ' + htmlentities(e.diff.actual) +
      '\n\nHTML Diff: ' + processQUnit(htmlentities(e.diff.comparison)) +
      extra;
  } else if (TestError.isPprintAssertionError(e)) {
    const dh = Differ.diffPrettyHtml(e.diff.actual, e.diff.expected);
    return 'Test failure: ' + e.message +
      '\nExpected: \n' + htmlentities(e.diff.expected) +
      '\nActual: \n' + htmlentities(e.diff.actual) +
      '\nDiff: \n' + dh + extra;
  } else if (TestError.isAssertionError(e)) {
    return 'Assertion error' + (e.message ? ' [' + e.message + ']' : '') +
      ': [' + htmlentities(JSON.stringify(e.expected)) + '] ' + e.operator +
      ' [' + htmlentities(JSON.stringify(e.actual)) + ']' + extra;
  } else if (e.name && e.message) {
    return htmlentities(e.name + ': ' + e.message + extra);
  } else if (e.toString !== undefined) {
    return htmlentities(String(e) + extra);
  } else {
    return htmlentities(JSON.stringify(e) + extra);
  }
};

export const text = (err: LoggedError): string => {
  const e = err === undefined ? new Error('no error given') : err.error;
  const extra = formatExtra(err);

  if (TestError.isPprintAssertionError(e)) {
    return pprintAssertionText(e) + extra;
  } else {
    return html(err);
  }
};

export const pprintAssertionText = (e: PprintAssertionError): string => {
  const dh = Differ.diffPrettyText(e.diff.actual, e.diff.expected);
  return 'Test failure: ' + e.message +
    '\nExpected: \n' + e.diff.expected +
    '\nActual: \n' + e.diff.actual +
    '\nDiff: \n' + dh;
};