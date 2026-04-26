export default function NeonAdapter(client) {
  return {
    async createVerificationToken(verificationToken) {
      const { identifier, expires, token } = verificationToken;
      await client.query(
        `
          INSERT INTO auth_verification_token (identifier, expires, token)
          VALUES ($1, $2, $3)
        `,
        [identifier, expires, token]
      );
      return verificationToken;
    },

    async useVerificationToken({ identifier, token }) {
      const result = await client.query(
        `
          DELETE FROM auth_verification_token
          WHERE identifier = $1 AND token = $2
          RETURNING identifier, expires, token
        `,
        [identifier, token]
      );
      return result.rowCount ? result.rows[0] : null;
    },

    async createUser(user) {
      const { name, email, emailVerified, image } = user;
      const result = await client.query(
        `
          INSERT INTO auth_users (name, email, "emailVerified", image)
          VALUES ($1, $2, $3, $4)
          RETURNING id, name, email, "emailVerified", image
        `,
        [name, email, emailVerified, image]
      );
      return result.rows[0];
    },

    async getUser(id) {
      const result = await client.query('SELECT * FROM auth_users WHERE id = $1', [id]);
      return result.rowCount ? result.rows[0] : null;
    },

    async getUserByEmail(email) {
      const result = await client.query('SELECT * FROM auth_users WHERE email = $1', [email]);
      if (!result.rowCount) return null;

      const user = result.rows[0];
      const accounts = await client.query(
        'SELECT * FROM auth_accounts WHERE "userId" = $1',
        [user.id]
      );

      return {
        ...user,
        accounts: accounts.rows,
      };
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const result = await client.query(
        `
          SELECT u.* FROM auth_users u
          JOIN auth_accounts a ON u.id = a."userId"
          WHERE a.provider = $1 AND a."providerAccountId" = $2
        `,
        [provider, providerAccountId]
      );
      return result.rowCount ? result.rows[0] : null;
    },

    async updateUser(user) {
      const existing = await client.query('SELECT * FROM auth_users WHERE id = $1', [user.id]);
      const merged = { ...existing.rows[0], ...user };
      const result = await client.query(
        `
          UPDATE auth_users
          SET name = $2, email = $3, "emailVerified" = $4, image = $5
          WHERE id = $1
          RETURNING id, name, email, "emailVerified", image
        `,
        [merged.id, merged.name, merged.email, merged.emailVerified, merged.image]
      );
      return result.rows[0];
    },

    async linkAccount(account) {
      const result = await client.query(
        `
          INSERT INTO auth_accounts (
            "userId",
            provider,
            type,
            "providerAccountId",
            access_token,
            expires_at,
            refresh_token,
            id_token,
            scope,
            session_state,
            token_type,
            password
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *
        `,
        [
          account.userId,
          account.provider,
          account.type,
          account.providerAccountId,
          account.access_token,
          account.expires_at,
          account.refresh_token,
          account.id_token,
          account.scope,
          account.session_state,
          account.token_type,
          account.extraData?.password,
        ]
      );
      return result.rows[0];
    },

    async createSession({ sessionToken, userId, expires }) {
      const result = await client.query(
        `
          INSERT INTO auth_sessions ("userId", expires, "sessionToken")
          VALUES ($1, $2, $3)
          RETURNING id, "sessionToken", "userId", expires
        `,
        [userId, expires, sessionToken]
      );
      return result.rows[0];
    },

    async getSessionAndUser(sessionToken) {
      if (!sessionToken) return null;

      const sessionResult = await client.query(
        'SELECT * FROM auth_sessions WHERE "sessionToken" = $1',
        [sessionToken]
      );
      if (!sessionResult.rowCount) return null;

      const session = sessionResult.rows[0];
      const userResult = await client.query('SELECT * FROM auth_users WHERE id = $1', [
        session.userId,
      ]);
      if (!userResult.rowCount) return null;

      return {
        session,
        user: userResult.rows[0],
      };
    },

    async updateSession(session) {
      const existing = await client.query(
        'SELECT * FROM auth_sessions WHERE "sessionToken" = $1',
        [session.sessionToken]
      );
      if (!existing.rowCount) return null;

      const merged = { ...existing.rows[0], ...session };
      const result = await client.query(
        `
          UPDATE auth_sessions
          SET expires = $2
          WHERE "sessionToken" = $1
          RETURNING id, "sessionToken", "userId", expires
        `,
        [merged.sessionToken, merged.expires]
      );
      return result.rows[0];
    },

    async deleteSession(sessionToken) {
      await client.query('DELETE FROM auth_sessions WHERE "sessionToken" = $1', [sessionToken]);
    },

    async unlinkAccount({ provider, providerAccountId }) {
      await client.query(
        'DELETE FROM auth_accounts WHERE "providerAccountId" = $1 AND provider = $2',
        [providerAccountId, provider]
      );
    },

    async deleteUser(userId) {
      await client.query('DELETE FROM auth_sessions WHERE "userId" = $1', [userId]);
      await client.query('DELETE FROM auth_accounts WHERE "userId" = $1', [userId]);
      await client.query('DELETE FROM auth_users WHERE id = $1', [userId]);
    },
  };
}
