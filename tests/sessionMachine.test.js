import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, submitAnswer } from '../src/core/sessionMachine.js';
const set={id:'test',passThreshold:80,items:[
{id:'a',stage:'word',vi:'a',en:'alpha'},{id:'b',stage:'word',vi:'b',en:'beta'},{id:'c',stage:'word',vi:'c',en:'gamma'},{id:'d',stage:'word',vi:'d',en:'delta'},{id:'e',stage:'word',vi:'e',en:'echo'}]};
test('wrong blocks progress and awards no score',()=>{let s=createSession({studentName:'Test',set,now:1});const r=submitAnswer({session:s,set,answer:'wrong',now:2});assert.equal(r.event.type,'incorrect');assert.equal(r.session.currentIndex,0);assert.equal(r.session.firstTryCorrect,0)});
test('corrected continues but awards no first-try score',()=>{let s=createSession({studentName:'Test',set,now:1});s=submitAnswer({session:s,set,answer:'wrong',now:2}).session;const r=submitAnswer({session:s,set,answer:'alpha',now:3});assert.equal(r.event.type,'corrected');assert.equal(r.session.currentIndex,1);assert.equal(r.session.firstTryCorrect,0)});
test('four of five first-try answers passes at 80 percent',()=>{let s=createSession({studentName:'Test',set,now:1});for(const [answer,now] of [['alpha',2],['beta',3],['gamma',4],['wrong',5],['delta',6]])s=submitAnswer({session:s,set,answer,now}).session;const r=submitAnswer({session:s,set,answer:'echo',now:7});assert.equal(r.event.completed,true);assert.equal(r.event.score,80);assert.equal(r.event.passed,true)});
