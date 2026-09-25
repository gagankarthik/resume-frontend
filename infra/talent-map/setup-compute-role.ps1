# ─────────────────────────────────────────────────────────────────────────────
# Talent map — give the Amplify app its AWS access.
#
# Already created (no action needed):
#   DynamoDB table   blue-iq-hire-talent   (on-demand, KMS, PITR, TTL on `ttl`,
#                                           deletion protection)
#   Location API key blue-iq-hire-talent-maps (map tiles only, referrer-locked)
#
# This script does the remaining three steps, which need IAM rights:
#   1. create the SSR compute role with the least-privilege policy beside it
#   2. attach it to the Amplify app `resume-frontend` (dh8jqvx96jdpd)
#   3. set the talent-map environment variables on the `master` branch
#
# Branch-level variables are used on purpose: `update-app --environment-variables`
# REPLACES every app-level variable, which would wipe the Cognito settings.
#
# Run from this folder:  pwsh ./setup-compute-role.ps1
# ─────────────────────────────────────────────────────────────────────────────
$ErrorActionPreference = 'Stop'
$AppId  = 'dh8jqvx96jdpd'
$Branch = 'master'
$Region = 'us-east-2'
$Role   = 'blue-iq-hire-amplify-compute'
$Here   = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Role + inline policy
aws iam create-role --role-name $Role `
  --description 'SSR compute role for the Blue-IQ Hire Amplify app (talent map data + geocoding)' `
  --assume-role-policy-document "file://$Here/compute-role-trust.json" `
  --tags Key=Project,Value=blue-iq-hire Key=Feature,Value=talent-heat-map | Out-Null
aws iam put-role-policy --role-name $Role --policy-name talent-map-access `
  --policy-document "file://$Here/compute-role-policy.json"
$RoleArn = aws iam get-role --role-name $Role --query Role.Arn --output text
Write-Host "Role: $RoleArn"

# 2. Attach as the app's compute role
aws amplify update-app --app-id $AppId --compute-role-arn $RoleArn --region $Region | Out-Null
Write-Host "Attached to Amplify app $AppId"

# 3. Branch environment variables (keeps any existing branch variables)
$MapKey = aws location describe-key --key-name blue-iq-hire-talent-maps --region $Region --query Key --output text
# Keys the one-way candidate fingerprint. Set once and never change it: a new
# secret makes every re-uploaded candidate look new, so they would count twice.
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$Secret = -join ($bytes | ForEach-Object { '{0:x2}' -f $_ })
$existing = aws amplify get-branch --app-id $AppId --branch-name $Branch --region $Region --query 'branch.environmentVariables' --output json | ConvertFrom-Json
$vars = @{}
if ($existing) { $existing.PSObject.Properties | ForEach-Object { $vars[$_.Name] = $_.Value } }
$vars['NEXT_TALENT_TABLE'] = 'blue-iq-hire-talent'
$vars['NEXT_TALENT_EXTRACTIONS_TABLE'] = 'resume-extractions'
$vars['NEXT_TALENT_DEFAULT_TENANT'] = 'oceanblue'
# Internal team view: show every company on screen; exports keep the minimum of 5.
$vars['NEXT_TALENT_MIN_COUNT'] = '1'
$vars['NEXT_TALENT_MAP_API_KEY'] = $MapKey
if (-not $vars.ContainsKey('NEXT_TALENT_FINGERPRINT_SECRET')) { $vars['NEXT_TALENT_FINGERPRINT_SECRET'] = $Secret }
$pairs = ($vars.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ','
aws amplify update-branch --app-id $AppId --branch-name $Branch --environment-variables $pairs --region $Region | Out-Null
Write-Host 'Branch variables set: NEXT_TALENT_TABLE, NEXT_TALENT_DEFAULT_TENANT, NEXT_TALENT_MAP_API_KEY, NEXT_TALENT_FINGERPRINT_SECRET'
Write-Host 'Redeploy the branch for the new role and variables to take effect.'
