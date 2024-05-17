/**
 * Adds to/from methods for JSON conversion.
 * `BaseInterface` Is the main interface, with multiple type options on properties.
 * `DefinedInterface` Is an interface where all properties have their types specified.
 * It should be used, when data is converted (i.e. from string to DateTime class).
 * `JSONInterface` Is an interface that contains only basic JSON compatible types.
 */
export interface JSONConverter<DefinedInterface, JSONInterface> {
  /**
   * Convert to JSON compatible property types.
   */
  toJSON(data: DefinedInterface): JSONInterface;

  /**
   * Convert data to defined type state. Ready to use in logic.
   * @param data json object or BaseInterface type.
   * @throws TypeError if data is not compatible.
   */
  toDefined(data: unknown): DefinedInterface;
}
