export function friendlyErrorMessage(code: string): string {
  switch (code) {
    case 'ALLOCATION_OVERLAP':
      return 'Allocation overlaps with existing allocation';
    case 'ASSIGNMENT_OVERLAP':
      return 'Operator already assigned for this period';
    case 'NO_INTERNAL_ASSET_AVAILABLE':
      return 'No internal asset available';
    case 'MISSING_REQUIRED_TICKETS':
      return 'Operator is missing required tickets';
    default:
      return code;
  }
}
