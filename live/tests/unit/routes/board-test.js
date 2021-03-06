import EmberObject from '@ember/object';
import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | board', function() {

  setupTest('route:board', {
    needs: ['service:current-routed-modal', 'service:session']
  });

  const findRecord = sinon.stub();
  let route;

  beforeEach(function() {

    this.register('service:store', Service.extend({
      findRecord: findRecord
    }));
    this.inject.service('store', { as: 'store' });
    this.register('service:session', Service.extend({
      data: { authenticated: { userId: 12, token: 'VALID-TOKEN' } }
    }));

    this.inject.service('session', { as: 'session' });
    route = this.subject();
    route.transitionTo = sinon.spy();
  });

  it('exists', function() {
    route = this.subject();
    expect(route).to.be.ok;
  });

  it('should correctly call the store', function() {
    // given
    findRecord.resolves();

    // when
    route.model();

    // then
    sinon.assert.calledOnce(findRecord);
    sinon.assert.calledWith(findRecord, 'user', 12);
  });

  it('should return user first organization informations', function() {
    // given
    const firstOrganization = EmberObject.create({ id: 1, snapshots: [] });
    const reloadStub = sinon.stub();
    firstOrganization.get = sinon.stub().returns({
      reload: reloadStub
    });
    const user = EmberObject.create({ id: 1, organizations: [firstOrganization, { id: 2 }] });
    findRecord.resolves(user);

    // when
    const result = route.model();

    // then
    return result.then((model) => {
      expect(model.organization.id).to.equal(1);
    });
  });

  it('should return load snapshots every time with reload', function() {
    // given
    const firstOrganization = EmberObject.create({ id: 1, snapshots: [] });
    const reloadStub = sinon.stub();
    firstOrganization.get = sinon.stub().returns({
      reload: reloadStub
    });

    const user = EmberObject.create({ id: 1, organizations: [firstOrganization, { id: 2 }] });
    findRecord.resolves(user);

    // when
    const result = route.model();

    // then
    return result.then((model) => {
      expect(model.organization.id).to.equal(1);
      sinon.assert.calledWith(firstOrganization.get, 'snapshots');
      sinon.assert.calledOnce(reloadStub);
    });
  });

  it('should return url to download snapshots CSV', function() {
    // given
    const firstOrganization = EmberObject.create({ id: 1, snapshots: [] });
    const reloadStub = sinon.stub();
    sinon.stub(firstOrganization, 'get')
      .withArgs('id').returns(2)
      .withArgs('snapshots').returns({
        reload: reloadStub
      });
    const user = EmberObject.create({ id: 1, organizations: [firstOrganization, { id: 2 }] });
    findRecord.resolves(user);

    // when
    const result = route.model();

    // then
    return result.then((model) => {
      expect(model.organization.id).to.equal(1);
      expect(model.organizationSnapshotsExportUrl).to.be.equal('http://localhost:3000/api/organizations/2/snapshots/export?userToken=VALID-TOKEN');

    });
  });

  it('should return to home page if no user was found', function() {
    // given
    findRecord.rejects();

    // when
    const result = route.model();

    // then
    return result.then(_ => {
      sinon.assert.calledOnce(route.transitionTo);
      sinon.assert.calledWith(route.transitionTo, 'index');
    });
  });

  it('should return to /compte when the user has no organization', function() {
    // given
    const user = EmberObject.create({ id: 1, organizations: [] });
    findRecord.resolves(user);

    // when
    const result = route.model();

    // then
    return result.then(_ => {
      sinon.assert.calledOnce(route.transitionTo);
      sinon.assert.calledWith(route.transitionTo, 'compte');
    });
  });
});
