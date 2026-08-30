#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${FIREBASE_PROJECT_ID:-chienbinhdich}"
PROJECT_NUMBER="907387062033"
POOL_ID="vercel-assess"
PROVIDER_ID="vercel"
VERCEL_OWNER_SLUG="thanhnguyendafa-6118s-projects"
VERCEL_PROJECT_ID="prj_pRXHJSe5Sa22ny8PoRFyCZO3h9YL"
ISSUER="https://oidc.vercel.com/${VERCEL_OWNER_SLUG}"
DEFAULT_AUDIENCE="https://vercel.com/${VERCEL_OWNER_SLUG}"

: "${GOOGLE_APPLICATION_CREDENTIALS:?GOOGLE_APPLICATION_CREDENTIALS is required}"
gcloud auth activate-service-account --key-file="$GOOGLE_APPLICATION_CREDENTIALS" --project="$PROJECT_ID" >/dev/null

gcloud services enable sts.googleapis.com iamcredentials.googleapis.com --project="$PROJECT_ID" --quiet >/dev/null

if ! gcloud iam workload-identity-pools describe "$POOL_ID" --location=global --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools create "$POOL_ID" \
    --location=global \
    --project="$PROJECT_ID" \
    --display-name="Vercel Assess" \
    --description="Short-lived Vercel OIDC identity for Assess backend" >/dev/null
fi

if ! gcloud iam workload-identity-pools providers describe "$PROVIDER_ID" \
  --workload-identity-pool="$POOL_ID" --location=global --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
    --workload-identity-pool="$POOL_ID" \
    --location=global \
    --project="$PROJECT_ID" \
    --display-name="Vercel OIDC" \
    --issuer-uri="$ISSUER" \
    --allowed-audiences="$DEFAULT_AUDIENCE" \
    --attribute-mapping="google.subject=assertion.sub,attribute.project_id=assertion.project_id,attribute.environment=assertion.environment" \
    --attribute-condition="assertion.project_id=='${VERCEL_PROJECT_ID}'" >/dev/null
fi

PRINCIPAL_SET="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.project_id/${VERCEL_PROJECT_ID}"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="$PRINCIPAL_SET" \
  --role="roles/datastore.user" \
  --condition=None \
  --quiet >/dev/null

echo "WIF_READY pool=${POOL_ID} provider=${PROVIDER_ID} project=${VERCEL_PROJECT_ID}"
