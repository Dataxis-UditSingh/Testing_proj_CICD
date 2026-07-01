# GPG Key Integration Guide for GitHub (macOS)

> **Objective:**
> This guide explains how to generate a GPG key, configure Git, integrate it with GitHub, troubleshoot common issues, and understand how commit signing works in a real-world development workflow.

---

# What is GPG?

**GPG (GNU Privacy Guard)** is an encryption and digital signing tool.

In Git, GPG is primarily used to:

* Verify that a commit was actually created by the developer.
* Prevent commit impersonation.
* Secure release tags.
* Improve repository security and auditability.

---

# Why Do We Need GPG?

Without GPG:

```text
Developer
      │
      ▼
Git Commit
      │
      ▼
GitHub

Anyone can create a commit using your name and email.
```

With GPG:

```text
Developer
      │
Private Key Signs Commit
      │
      ▼
Signed Commit
      │
      ▼
GitHub verifies using Public Key
      │
      ▼
Verified ✓ Badge
```

---

# How GPG Works

Every developer owns **two keys**.

## Public Key

* Shared publicly
* Uploaded to GitHub
* Used only for verification

Example:

```text
GitHub
CI/CD
Anyone
```

can have your Public Key.

---

## Private Key

* Stored only on your computer
* Never shared
* Used to sign commits

Example:

```text
MacBook
```

Only your machine should contain the private key.

---

# Overall Flow

```text
                Generate Keys
                     │
                     ▼
          ┌─────────────────────┐
          │   Public Key         │─────────────► GitHub
          └─────────────────────┘

          ┌─────────────────────┐
          │   Private Key        │
          │ (Developer Machine)  │
          └─────────────────────┘
                     │
                     ▼
             Sign Every Commit
                     │
                     ▼
                 GitHub
                     │
                     ▼
              Verified ✓ Badge
```

---

# Step 1 - Install GPG

Check installation

```bash
gpg --version
```

If GPG is not installed

```bash
brew install gnupg
```

---

# Step 2 - Generate a New GPG Key

Run

```bash
gpg --full-generate-key
```

Choose

```text
(1) RSA and RSA
4096
Key does not expire (0)
```

Enter

```text
Real Name:
Udit Singh

Email:
your-github-email@example.com
```

Example

```text
Real Name:
Udit Singh

Email:
github-email@example.com
```

---

# Step 3 - Create a Passphrase

You will be asked

```text
Enter Passphrase
Confirm Passphrase
```

Example

```text
Udit@GPG2026Secure!
```

The passphrase protects your private key.

**Important**

Never forget this password.

---

# Step 4 - Verify the Key

Run

```bash
gpg --list-secret-keys --keyid-format LONG
```

Example

```text
sec   rsa4096/0B186563570F72B8300BD86BD9C245960CB5C9EA
```

Your Key ID is

```text
0B186563570F72B8300BD86BD9C245960CB5C9EA
```

---

# Step 5 - Export Public Key

Run

```bash
gpg --armor --export 0B186563570F72B8300BD86BD9C245960CB5C9EA
```

Output

```text
-----BEGIN PGP PUBLIC KEY BLOCK-----

...

-----END PGP PUBLIC KEY BLOCK-----
```

Copy the **entire block** including:

* BEGIN
* END

---

# Step 6 - Upload Public Key to GitHub

Open

```
GitHub
    ↓
Settings
    ↓
SSH and GPG Keys
    ↓
New GPG Key
```

Paste

```text
-----BEGIN PGP PUBLIC KEY BLOCK-----

...

-----END PGP PUBLIC KEY BLOCK-----
```

Click

```
Add GPG Key
```

---

# Step 7 - Configure Git

Set signing key

```bash
git config --global user.signingkey 0B186563570F72B8300BD86BD9C245960CB5C9EA
```

Enable signing

```bash
git config --global commit.gpgsign true
```

Verify

```bash
git config --global --list
```

Example

```text
user.signingkey=0B186563570F72B8300BD86BD9C245960CB5C9EA

commit.gpgsign=true
```

---

# Step 8 - Configure macOS (Pinentry)

Install

```bash
brew install pinentry-mac
```

Check

```bash
which pinentry-mac
```

Example

```text
/opt/homebrew/bin/pinentry-mac
```

Configure

```bash
echo "pinentry-program $(which pinentry-mac)" > ~/.gnupg/gpg-agent.conf
```

Restart

```bash
gpgconf --kill gpg-agent
gpgconf --launch gpg-agent
```

---

# Step 9 - Configure GPG_TTY

Run

```bash
echo 'export GPG_TTY=$(tty)' >> ~/.zshrc
```

Reload

```bash
source ~/.zshrc
```

---

# Step 10 - Test GPG

Run

```bash
echo "test" | gpg --clearsign
```

If a passphrase popup appears and the output is

```text
-----BEGIN PGP SIGNED MESSAGE-----

...

-----BEGIN PGP SIGNATURE-----

...

-----END PGP SIGNATURE-----
```

then GPG is working correctly.

---

# Step 11 - Create a Signed Commit

```bash
git add .

git commit -m "Testing GPG Signing"
```

A passphrase popup will appear.

Enter your GPG passphrase.

---

# Step 12 - Push

```bash
git push
```

---

# Step 13 - Verify Signature

Open GitHub.

Navigate to the commit.

You should see

```text
Verified ✓
```

---

# Verify from Terminal

```bash
git log --show-signature -1
```

Expected

```text
gpg: Good signature from "Udit Singh"
```

---

# Real CI/CD Workflow

```text
Developer
      │
      ▼
Write Code
      │
      ▼
git add .
      │
      ▼
git commit
      │
Private Key Signs Commit
      │
      ▼
git push
      │
      ▼
GitHub verifies signature
      │
      ▼
Verified Commit
      │
      ▼
Jenkins Pipeline
      │
      ▼
Docker Build
      │
      ▼
DockerHub
      │
      ▼
Kubernetes Deployment
```

---

# Common Errors

---

## Error

```text
gpg: signing failed:
Inappropriate ioctl for device
```

### Cause

Terminal cannot communicate with GPG.

### Solution

```bash
echo 'export GPG_TTY=$(tty)' >> ~/.zshrc

source ~/.zshrc
```

Restart

```bash
gpgconf --kill gpg-agent
```

---

## Error

```text
No pinentry
```

### Cause

pinentry is missing.

### Solution

```bash
brew install pinentry-mac
```

Configure

```bash
echo "pinentry-program $(which pinentry-mac)" > ~/.gnupg/gpg-agent.conf
```

Restart

```bash
gpgconf --kill gpg-agent

gpgconf --launch gpg-agent
```

---

## Error

```text
Passphrases don't match
```

### Cause

Different passwords entered.

### Solution

Type the exact same passphrase twice.

---

## Error

```text
No secret key
```

### Cause

Git is pointing to an incorrect Key ID.

### Solution

Run

```bash
gpg --list-secret-keys --keyid-format LONG
```

Update Git

```bash
git config --global user.signingkey YOUR_KEY_ID
```

---

# Useful Commands

List Public Keys

```bash
gpg --list-keys
```

List Secret Keys

```bash
gpg --list-secret-keys
```

Export Public Key

```bash
gpg --armor --export KEY_ID
```

Delete Public Key

```bash
gpg --delete-key KEY_ID
```

Delete Secret Key

```bash
gpg --delete-secret-key KEY_ID
```

Test Signature

```bash
echo "test" | gpg --clearsign
```

Check Signed Commit

```bash
git log --show-signature -1
```

---

# Best Practices

* Never share your Private Key.
* Upload only your Public Key to GitHub.
* Keep your passphrase secure.
* Use a strong passphrase.
* Enable commit signing globally.
* Sign release tags.
* Back up your private key securely.

---

# Final Architecture

```text
                         Developer

                             │

                 Generates GPG Key Pair

                             │

        ┌────────────────────┴────────────────────┐
        │                                         │

        ▼                                         ▼

 Public Key                              Private Key

        │                                         │

Upload to GitHub                       Stored on Local Machine

        │                                         │

        ▼                                         ▼

GitHub verifies commits               Signs every Git commit

        └────────────────────┬────────────────────┘
                             │
                             ▼

                     Verified Git Commit ✓

                             │

                             ▼

                       Jenkins Pipeline

                             │

                             ▼

                         Docker Image

                             │

                             ▼

                        Docker Registry

                             │

                             ▼

                    Kubernetes Deployment
```

---

# Conclusion

GPG signing ensures that every Git commit is cryptographically signed using the developer's private key. GitHub verifies the signature using the uploaded public key and displays a **Verified ✓** badge for authentic commits. This process strengthens repository security, prevents commit impersonation, and is widely adopted in professional software development and CI/CD workflows.
