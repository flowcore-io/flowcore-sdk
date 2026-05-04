import {
  type Static,
  type TArray,
  type TBoolean,
  type TLiteral,
  type TNull,
  type TObject,
  type TOptional,
  type TRecord,
  type TString,
  type TUnion,
  Type,
} from "@sinclair/typebox"

/**
 * The schema for AWS Marketplace dedicated cluster types.
 */
export const AwsMarketplaceDedicatedClusterTypeSchema: TUnion<[TLiteral<"managed">, TLiteral<"self-hosted">]> = Type
  .Union([
    Type.Literal("managed"),
    Type.Literal("self-hosted"),
  ])

/**
 * The type for AWS Marketplace dedicated cluster types.
 */
export type AwsMarketplaceDedicatedClusterType = Static<typeof AwsMarketplaceDedicatedClusterTypeSchema>

/**
 * The schema for AWS Marketplace product properties.
 */
export const AwsMarketplaceProductPropertiesSchema: TRecord<TString, TOptional<TString>> = Type.Record(
  Type.String(),
  Type.Optional(Type.String()),
)

/**
 * The type for AWS Marketplace product properties.
 */
export type AwsMarketplaceProductProperties = Static<typeof AwsMarketplaceProductPropertiesSchema>

/**
 * The schema for AWS Marketplace customer product modes.
 */
export const AwsMarketplaceProductModeSchema: TUnion<[TLiteral<"basic">, TLiteral<"dedicated">]> = Type.Union([
  Type.Literal("basic"),
  Type.Literal("dedicated"),
])

/**
 * The type for AWS Marketplace customer product modes.
 */
export type AwsMarketplaceProductMode = Static<typeof AwsMarketplaceProductModeSchema>

/**
 * The schema for an AWS Marketplace customer.
 */
export const AwsMarketplaceCustomerSchema: TObject<{
  customerId: TString
  productCode: TString
  accountId: TString
  metadata: TString
  productMode: typeof AwsMarketplaceProductModeSchema
}> = Type.Object({
  customerId: Type.String(),
  productCode: Type.String(),
  accountId: Type.String(),
  metadata: Type.String(),
  productMode: AwsMarketplaceProductModeSchema,
})

/**
 * The type for an AWS Marketplace customer.
 */
export type AwsMarketplaceCustomer = Static<typeof AwsMarketplaceCustomerSchema>

/**
 * The schema for an AWS Marketplace link.
 */
export const AwsMarketplaceLinkSchema: TObject<{
  linkingId: TString
  awsCustomerId: TString
  awsProductCode: TString
  awsAccountId: TString
  tenant: TUnion<[TString, TNull]>
  tenantId: TString
  contactInfo: TUnion<[TString, TNull]>
  productProperties: TUnion<[TRecord<TString, TString>, TNull]>
  linkedAt: TString
}> = Type.Object({
  linkingId: Type.String(),
  awsCustomerId: Type.String(),
  awsProductCode: Type.String(),
  awsAccountId: Type.String(),
  tenant: Type.Union([Type.String(), Type.Null()]),
  tenantId: Type.String(),
  contactInfo: Type.Union([Type.String(), Type.Null()]),
  productProperties: Type.Union([Type.Record(Type.String(), Type.String()), Type.Null()]),
  linkedAt: Type.String(),
})

/**
 * The type for an AWS Marketplace link.
 */
export type AwsMarketplaceLink = Static<typeof AwsMarketplaceLinkSchema>

/**
 * The schema for the AWS Marketplace customer resolve response.
 */
export const AwsMarketplaceCustomerResolveSchema: TObject<{
  success: TBoolean
  customer: typeof AwsMarketplaceCustomerSchema
}> = Type.Object({
  success: Type.Boolean(),
  customer: AwsMarketplaceCustomerSchema,
})

/**
 * The type for the AWS Marketplace customer resolve response.
 */
export type AwsMarketplaceCustomerResolve = Static<typeof AwsMarketplaceCustomerResolveSchema>

/**
 * The schema for the AWS Marketplace link create response.
 */
export const AwsMarketplaceLinkCreateSchema: TObject<{
  success: TBoolean
  linkingId: TString
  status: TLiteral<"linked">
}> = Type.Object({
  success: Type.Boolean(),
  linkingId: Type.String(),
  status: Type.Literal("linked"),
})

/**
 * The type for the AWS Marketplace link create response.
 */
export type AwsMarketplaceLinkCreate = Static<typeof AwsMarketplaceLinkCreateSchema>

/**
 * The schema for the AWS Marketplace link list response.
 */
export const AwsMarketplaceLinkListSchema: TObject<{
  success: TBoolean
  links: TArray<typeof AwsMarketplaceLinkSchema>
}> = Type.Object({
  success: Type.Boolean(),
  links: Type.Array(AwsMarketplaceLinkSchema),
})

/**
 * The type for the AWS Marketplace link list response.
 */
export type AwsMarketplaceLinkList = Static<typeof AwsMarketplaceLinkListSchema>

/**
 * The schema for the AWS Marketplace link fetch response.
 */
export const AwsMarketplaceLinkFetchSchema: TObject<{
  success: TBoolean
  link: typeof AwsMarketplaceLinkSchema
}> = Type.Object({
  success: Type.Boolean(),
  link: AwsMarketplaceLinkSchema,
})

/**
 * The type for the AWS Marketplace link fetch response.
 */
export type AwsMarketplaceLinkFetch = Static<typeof AwsMarketplaceLinkFetchSchema>

/**
 * The schema for the AWS Marketplace link delete response.
 */
export const AwsMarketplaceLinkDeleteSchema: TObject<{
  success: TBoolean
  linkingId: TString
  status: TLiteral<"unlinked">
}> = Type.Object({
  success: Type.Boolean(),
  linkingId: Type.String(),
  status: Type.Literal("unlinked"),
})

/**
 * The type for the AWS Marketplace link delete response.
 */
export type AwsMarketplaceLinkDelete = Static<typeof AwsMarketplaceLinkDeleteSchema>
