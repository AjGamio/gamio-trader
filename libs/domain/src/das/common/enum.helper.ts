/**
 * Represents a helper class for working with enums, providing methods to get descriptions and parameter counts.
 */
export class EnumHelper {
  /**
   * Cache for enum descriptions.
   * @private
   */
  private static readonly descriptionLocalCache: Map<
    string,
    Map<string, string | null>
  > = new Map();

  /**
   * Cache for enum parameter counts.
   * @private
   */
  private static readonly paramsCountCache: Map<string, Map<string, number>> =
    new Map();

  /**
   * Gets the description of an enum value.
   * @param {T} enumValue - The enum value.
   * @returns {string | null} The description of the enum value.
   */
  public static getEnumDescription<T extends string | number>(
    enumValue: T,
  ): string | null {
    if (typeof enumValue !== 'string' && typeof enumValue !== 'number') {
      return null;
    }

    const enumTypeName: string =
      typeof enumValue === 'string' ? enumValue : enumValue.constructor.name;

    if (!EnumHelper.isEnum(enumTypeName)) {
      return null;
    }

    const enumKey: string = enumValue.toString();
    const enumCache =
      EnumHelper.descriptionLocalCache.get(enumTypeName) || new Map();

    if (!enumCache.has(enumKey)) {
      const formattedEnumValue = EnumHelper.retrieveEnumDescription(enumValue);
      enumCache.set(enumKey, formattedEnumValue);
      EnumHelper.descriptionLocalCache.set(enumTypeName, enumCache);
    }

    return enumCache.get(enumKey) || null;
  }

  /**
   * Gets the parameter count of an enum value.
   * @param {T} enumValue - The enum value.
   * @returns {number | null} The parameter count of the enum value.
   */
  public static getEnumParamsCount<T extends string | number>(
    enumValue: T,
  ): number | null {
    if (typeof enumValue !== 'string' && typeof enumValue !== 'number') {
      return null;
    }

    const enumTypeName: string =
      typeof enumValue === 'string' ? enumValue : enumValue.constructor.name;

    if (!EnumHelper.isEnum(enumTypeName)) {
      return null;
    }

    const enumKey: string = enumValue.toString();
    const enumCache =
      EnumHelper.paramsCountCache.get(enumTypeName) || new Map();

    if (!enumCache.has(enumKey)) {
      enumCache.set(enumKey, EnumHelper.retrieveEnumParamsCount(enumValue));
      EnumHelper.paramsCountCache.set(enumTypeName, enumCache);
    }

    return enumCache.get(enumKey) || null;
  }

  /**
   * Checks if the given type name represents an enum.
   * @param {string} typeName - The type name to check.
   * @returns {boolean} True if the type is an enum; otherwise, false.
   * @private
   */
  private static isEnum(typeName: string): boolean {
    return /^[A-Z]/.test(typeName);
  }

  /**
   * Retrieves the description of an enum value.
   * @param {T} enumValue - The enum value.
   * @returns {string} The description of the enum value.
   * @private
   */
  private static retrieveEnumDescription<T extends string | number>(
    enumValue: T,
  ): string {
    const value: string = enumValue.toString();
    const fieldInfo: any = (enumValue as any).constructor[value];

    if (!fieldInfo) {
      return value;
    }

    const attrs: any[] = fieldInfo['attributes'];

    if (attrs && attrs.length > 0) {
      return attrs[0]['description'] || value;
    }

    return value;
  }

  /**
   * Retrieves the parameter count of an enum value.
   * @param {T} enumValue - The enum value.
   * @returns {number} The parameter count of the enum value.
   * @private
   */
  private static retrieveEnumParamsCount<T extends string | number>(
    enumValue: T,
  ): number {
    const value: string = enumValue.toString();
    const fieldInfo: any = (enumValue as any).constructor[value];

    if (!fieldInfo) {
      return 0;
    }

    const attrs: any[] = fieldInfo['attributes'];

    if (attrs && attrs.length > 0) {
      return attrs[0]['paramsCount'] || 0;
    }

    return 0;
  }
}
