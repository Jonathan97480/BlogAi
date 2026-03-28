import bcrypt from 'bcryptjs';
import assert from 'assert';

describe('Hashage du mot de passe', () => {
    it('doit valider le hash pour "azerty"', async () => {
        const password = 'azerty';
        const hash = await bcrypt.hash(password, 10);
        const isValid = await bcrypt.compare(password, hash);
        assert.strictEqual(isValid, true);
    });

    it('ne doit pas valider un mauvais mot de passe', async () => {
        const password = 'azerty';
        const hash = await bcrypt.hash(password, 10);
        const isValid = await bcrypt.compare('mauvais', hash);
        assert.strictEqual(isValid, false);
    });
});
