'use strict'
require('../../setup')

import utils from 'web3-utils';
import sinon from 'sinon';

import Contracts from '../../../src/artifacts/Contracts'
import Contract from '../../../src/artifacts/ZosContract';

const ContractWithStructInConstructor = Contracts.getFromLocal('WithStructInConstructor');
const InitializableMock = Contracts.getFromLocal('InitializableMock');

contract('Contract', function(accounts) {
  const [_, account] = accounts.map(utils.toChecksumAddress)
  const txParams = { from: account };

  describe('methods', function() {
    /*
     * It seems that truffle/web3 cannot parse correctly a struct that
     * is sent as an argument to a constructor, thus there is no way
     * of asserting the struct attributes/values in terms of equality,
     */
    describe('#new', function() {
      describe('arguments parsing', function() {
        context('when sending only a struct', function() {
          it('instantiates the contract', async function() {
            const args = { buz: 10, foo: 'foo', bar: 'bar' };
            const instance = await ContractWithStructInConstructor.new(args);

            (await instance.methods.buz().call()).should.not.be.null;
            (await instance.methods.foo().call()).should.not.be.null;
            (await instance.methods.bar().call()).should.not.be.null;
            (await instance.methods.sender().call()).should.eq(_);
          });
        });

        context('when sending a struct and txParams', function() {
          it('instantiates the contract', async function() {
            const args = { buz: 10, foo: 'foo', bar: 'bar' };
            const instance = await ContractWithStructInConstructor.new(args, txParams);

            (await instance.methods.buz().call()).should.not.be.null;
            (await instance.methods.foo().call()).should.not.be.null;
            (await instance.methods.bar().call()).should.not.be.null;
            (await instance.methods.sender().call()).should.eq(account);
          });
        });
      });
    });

    /* public ethods in contract:
     * initialize()
     * initializeNested()
     * initializeWithNested(uint256)
     * fail()
   */
    describe('#methodsFromAst', function() {
      beforeEach('set methods', function() {
        this.methods = InitializableMock.methodsFromAst();
      });

      it('returns only public functions', function() {
        const nonPublicMethods = this.methods.find(method => method.visibility !== 'public');
        const publicMethods = this.methods.filter(method => method.visibility === 'public');
        expect(nonPublicMethods).to.be.undefined;
        expect(publicMethods).to.have.lengthOf(this.methods.length);
      });

      it('returns methods with initializers', function() {
        const methods = this.methods.filter(({ hasInitializer }) => hasInitializer);
        expect(methods).to.have.lengthOf(3);
        expect(methods[0].name).to.eq('initialize');
        expect(methods[1].name).to.eq('initializeNested');
        expect(methods[2].name).to.eq('initializeWithX');
      });

      it('returns methods without initializers', function() {
        const methods = this.methods.filter(({ hasInitializer }) => !hasInitializer);
        expect(methods).to.have.lengthOf(1);
        expect(methods[0].name).to.eq('fail');
      });

      it('sets selectors', function() {
        expect(this.methods[0].selector).to.eq('initialize()');
        expect(this.methods[1].selector).to.eq('initializeNested()');
        expect(this.methods[2].selector).to.eq('initializeWithX(uint256)');
        expect(this.methods[3].selector).to.eq('fail()');
      });

      it('sets method inputs', function() {
        expect(this.methods[0].inputs).to.be.empty;
        expect(this.methods[1].inputs).to.be.empty;
        expect(this.methods[2].inputs).to.have.lengthOf(1)
        expect(this.methods[2].inputs[0].name).to.eq('_x');
        expect(this.methods[2].inputs[0].type).to.eq('uint256');
        expect(this.methods[3].inputs).to.be.empty;
      });
    });
  });
});

