import pg from "pg";

const { Pool } = pg;

let pool = null;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "No database connection string was provided to Postgres. Perhaps process.env.DATABASE_URL has not been set",
    );
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }

  return pool;
}

function compileTemplate(strings, values) {
  let text = "";
  const params = [];

  for (let index = 0; index < strings.length; index += 1) {
    text += strings[index];
    if (index < values.length) {
      params.push(values[index]);
      text += `$${params.length}`;
    }
  }

  return { text, params };
}

async function runQuery(text, params = []) {
  const result = await getPool().query(text, params);
  return result.rows;
}

function sql(stringsOrText, ...values) {
  if (Array.isArray(stringsOrText) && Object.prototype.hasOwnProperty.call(stringsOrText, "raw")) {
    const { text, params } = compileTemplate(stringsOrText, values);
    return runQuery(text, params);
  }

  return runQuery(stringsOrText, values[0] || []);
}

sql.transaction = async (callback) => {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const tx = (stringsOrText, ...values) => {
      if (Array.isArray(stringsOrText) && Object.prototype.hasOwnProperty.call(stringsOrText, "raw")) {
        const { text, params } = compileTemplate(stringsOrText, values);
        return client.query(text, params).then((result) => result.rows);
      }

      return client.query(stringsOrText, values[0] || []).then((result) => result.rows);
    };
    const result = await callback(tx);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export default sql;
