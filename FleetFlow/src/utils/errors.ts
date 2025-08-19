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
    case 'INVALID_DATE_RANGE':
      return 'Start date must be before end date';
    case 'REQUEST_NOT_FOUND':
      return 'Request not found';
    case 'UNAUTHORIZED':
      return 'You are not authorized to perform this action';
    default:
      return code;
  }
}
