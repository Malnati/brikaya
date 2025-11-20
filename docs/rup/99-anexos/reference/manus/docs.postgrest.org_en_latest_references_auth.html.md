
**URL:** https://docs.postgrest.org/en/latest/references/auth.html

---

 PostgREST devel
v13
v12
v11
v10
stable
latest
 

TUTORIALS

Tutorial 0 - Get it Running
Tutorial 1 - The Golden Key

REFERENCES

Authentication
Overview of role system
JWT Authentication
JWT Signature Verification
JWT Claims Validation
JWT Cache
JWT Role Extraction
JWT Security
Custom Validation
API
CLI
Transactions
Connection Pool
Schema Cache
Errors
Configuration
Observability
Admin Server
Listener

EXPLANATIONS

Architecture
Database Authorization
External Authentication
Installation
Nginx
Schema Isolation

HOW-TO GUIDES

SQL User Management
SQL User Management using postgres’ users and passwords
Working with PostgreSQL data types
Create a SOAP endpoint
Providing HTML Content Using Htmx
Providing images for <img>

INTEGRATIONS

pg-safeupdate
systemd

ECOSYSTEM

Community Tutorials
Templates
Example Apps
DevOps
External Notification
Extensions
Client-Side Libraries
 Authentication
View page source
Authentication

PostgREST is designed to keep the database at the center of API security. All authorization happens in the database . It is PostgREST’s job to authenticate requests – i.e. verify that a client is who they say they are – and then let the database authorize client actions.

Overview of role system

There are three types of roles used by PostgREST, the authenticator, anonymous and user roles. The database administrator creates these roles and configures PostgREST to use them.

The authenticator role is used for connecting to the database and should be configured to have very limited access. It is a chameleon whose job is to “become” other users to service authenticated HTTP requests.

CREATE ROLE authenticator LOGIN NOINHERIT NOCREATEDB NOCREATEROLE NOSUPERUSER;
CREATE ROLE anonymous NOLOGIN;
CREATE ROLE webuser NOLOGIN;


Note

The names “authenticator” and “anon” names are configurable and not sacred, we simply choose them for clarity. See db-uri and db-anon-role.

User Impersonation

The picture below shows how the server handles authentication. If auth succeeds, it switches into the user role specified by the request, otherwise it switches into the anonymous role (if it’s set in db-anon-role).

This role switching mechanism is called user impersonation. In PostgreSQL it’s done with the SET ROLE statement.

Note

The impersonated roles will have their settings applied. See Impersonated Role Settings.

JWT Authentication

We use JSON Web Tokens to authenticate API requests, this allows us to be stateless and not require database lookups for verification. As you’ll recall a JWT contains a list of cryptographically signed claims. All claims are allowed but PostgREST cares specifically about a claim called role (configurable with JWT Role Extraction).

{
  "role": "user123"
}


When a request contains a valid JWT with a role claim PostgREST will switch to the database role with that name for the duration of the HTTP request.

SET LOCAL ROLE user123;


Note that the database administrator must allow the authenticator role to switch into this user by previously executing

GRANT user123 TO authenticator;
-- similarly for the anonymous role
-- GRANT anonymous TO authenticator;


If the client included no JWT (or one without a role claim) then PostgREST switches into the anonymous role. The database administrator must set the anonymous role permissions correctly to prevent anonymous users from seeing or changing things they shouldn’t.

Bearer Authentication

To make an authenticated request the client must include an Authorization HTTP header with the value Bearer <jwt>. For instance:

curl "http://localhost:3000/foo" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiamRvZSIsImV4cCI6MTQ3NTUxNjI1MH0.GYDZV3yM0gqvuEtJmfpplLBXSGYnke_Pvnl0tbKAjB4"


The Bearer header value can be used with or without capitalization(bearer).

JWT Generation

You can create a valid JWT either from inside your database (see SQL User Management) or via an external service (see External Authentication).

JWT Signature Verification

PostgREST supports both symmetric and asymmetric keys for verifying the signature of the token.

Symmetric Keys

In the case of symmetric cryptography the signer and verifier share the same secret passphrase, which can be configured with jwt-secret. If it is set to a simple string then PostgREST interprets it as an HMAC-SHA256 passphrase.

jwt-secret = "reallyreallyreallyreallyverysafe"

Asymmetric Keys

In asymmetric cryptography the signer uses the private key and the verifier the public key.

As described in the Configuration section, PostgREST accepts a jwt-secret config file parameter. However you can also specify a literal JSON Web Key (JWK) or set. For example, you can use an RSA-256 public key encoded as a JWK:

{
  "alg":"RS256",
  "e":"AQAB",
  "key_ops":["verify"],
  "kty":"RSA",
  "n":"9zKNYTaYGfGm1tBMpRT6FxOYrM720GhXdettc02uyakYSEHU2IJz90G_MLlEl4-WWWYoS_QKFupw3s7aPYlaAjamG22rAnvWu-rRkP5sSSkKvud_IgKL4iE6Y2WJx2Bkl1XUFkdZ8wlEUR6O1ft3TS4uA-qKifSZ43CahzAJyUezOH9shI--tirC028lNg767ldEki3WnVr3zokSujC9YJ_9XXjw2hFBfmJUrNb0-wldvxQbFU8RPXip-GQ_JPTrCTZhrzGFeWPvhA6Rqmc3b1PhM9jY7Dur1sjYWYVyXlFNCK3c-6feo5WlRfe1aCWmwZQh6O18eTmLeT4nWYkDzQ"
}


Note

This could also be a JSON Web Key Set (JWKS) if it was contained within an array assigned to a keys member, e.g. { keys: [jwk1, jwk2] }.

Just pass it in as a single line string, escaping the quotes:

jwt-secret = "{ \"alg\":\"RS256\", … }"


To generate such a public/private key pair use a utility like latchset/jose.

jose jwk gen -i '{"alg": "RS256"}' -o rsa.jwk
jose jwk pub -i rsa.jwk -o rsa.jwk.pub

# now rsa.jwk.pub contains the desired JSON object


You can specify the literal value as we saw earlier, or reference a filename to load the JWK from a file:

jwt-secret = "@rsa.jwk.pub"

kid verification

PostgREST has built-in verification of the key ID parameter, useful when working with a JSON Web Key Set. It goes as follows:

If the JWT contains a kid parameter, then PostgREST will look for the JSON Web Key in the jwt-secret.

If no key has a matching kid (or if they don’t have one defined), the token will be rejected with a 401 Unauthorized error.

If a key matches the kid value then it will validate the token against that key accordingly.

If the JWT doesn’t have a kid, PostgREST will try each key in the jwt-secret one by one until it finds one that works.

