const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/organization-serializer');
const BookshelfOrganization = require('../../../../../lib/infrastructure/data/organization');
const Organization = require('../../../../../lib/domain/models/Organization');

const faker = require('faker');

describe('Unit | Serializer | organization-serializer', () => {

  describe('#serialize', () => {

    context('when user is defined', () => {

      it('should serialize organization with included user', () => {
        // given
        const jsonOrganization = {
          id: 12,
          name: 'LexCorp',
          type: 'PRO',
          email: 'lex@lexcorp.com',
          code: 'ABCD66',
          userId: '42157',
          user: {
            id: 42157,
            firstName: 'Alexander',
            lastName: 'Luthor',
            email: 'lex@lexcorp.com'
          }
        };
        const organization = new Organization(jsonOrganization);

        // when
        const serializedOrganization = serializer.serialize(organization);

        // then
        expect(serializedOrganization).to.deep.equal({
          data: {
            type: 'organizations',
            id: 12,
            attributes: {
              name: 'LexCorp',
              email: 'lex@lexcorp.com',
              type: 'PRO',
              code: 'ABCD66'
            },
            relationships: {
              user: {
                data: { type: 'users', id: '42157' }
              },
            }
          },
          included: [{
            id: '42157',
            type: 'users',
            attributes: {
              'first-name': 'Alexander',
              'last-name': 'Luthor',
              email: 'lex@lexcorp.com'
            }
          }]
        });
      });
    });

    it('should serialize an array of organization', () => {
      // given
      const organizationOne = new Organization({
        id: 1,
        name: faker.name.firstName(),
        email: faker.internet.email().toLowerCase(),
        type: 'PRO',
        code: 'ABCD12',
        userId: 3,
        user: {
          id: 3,
          firstName: 'Ezzio',
          lastName: 'Auditore',
          email: 'ezzio@firenze.it'
        }
      });

      const organizationTwo = new Organization({
        id: 2,
        name: faker.name.firstName(),
        email: faker.internet.email().toLowerCase(),
        type: 'PRO',
        code: 'EFGH54',
        userId: 4,
        user: {
          id: 4,
          firstName: 'Bayek',
          lastName: 'Siwa',
          email: 'bayek@siwa.eg'
        }
      });

      const expectedJsonApi = {
        data: [{
          type: 'organizations',
          id: 1,
          attributes: {
            name: organizationOne.name,
            type: organizationOne.type,
            email: organizationOne.email,
            code: organizationOne.code,
          },
          relationships: {
            user: {
              data: {
                id: '3',
                type: 'users'
              }
            }
          }
        }, {
          type: 'organizations',
          id: 2,
          attributes: {
            name: organizationTwo.name,
            type: organizationTwo.type,
            email: organizationTwo.email,
            code: organizationTwo.code,
          },
          relationships: {
            user: {
              data: {
                id: '4',
                type: 'users'
              }
            }
          }

        }],
        included: [{
          attributes: {
            email: 'ezzio@firenze.it',
            'first-name': 'Ezzio',
            'last-name': 'Auditore'
          },
          id: '3',
          type: 'users'
        }, {
          attributes: {
            email: 'bayek@siwa.eg',
            'first-name': 'Bayek',
            'last-name': 'Siwa'
          },
          id: '4',
          type: 'users'
        }]
      };

      // when
      const serializedArray = serializer.serialize([organizationOne, organizationTwo]);

      // then
      expect(serializedArray).to.deep.equal(expectedJsonApi);
    });

  });

  describe('#deserialize', () => {

    it('should convert JSON API data into a Organization model object', () => {
      const expectedModelObject = new BookshelfOrganization({
        name: 'The name of the organization',
        email: 'organization@email.com',
        type: 'SUP'
      });
      const jsonOrganization = {
        data: {
          attributes: {
            name: 'The name of the organization',
            email: 'organization@email.com',
            type: 'SUP',
            'first-name': 'Daft',
            'last-name': 'Punk'
          },
          type: 'organizations'
        }
      };

      // when
      const deserializedObject = serializer.deserialize(jsonOrganization);

      // then
      expect(deserializedObject.toJSON()).to.deep.equal(expectedModelObject.toJSON());
    });

  });

});

