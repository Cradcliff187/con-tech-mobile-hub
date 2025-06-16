
interface ParsedAddress {
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  parsing_confidence: 'high' | 'medium' | 'low';
  original_address: string;
  parsing_notes?: string;
}

export const parseAddress = (legacyAddress: string): ParsedAddress => {
  if (!legacyAddress || legacyAddress.trim() === '') {
    return {
      original_address: legacyAddress,
      parsing_confidence: 'low',
      parsing_notes: 'Empty or null address'
    };
  }

  const address = legacyAddress.trim();
  let street_address: string | undefined;
  let city: string | undefined;
  let state: string | undefined;
  let zip_code: string | undefined;
  let confidence: 'high' | 'medium' | 'low' = 'low';
  let notes: string[] = [];

  try {
    // Pattern 1: Full address with ZIP code
    // "123 Main St, Austin, TX 78701"
    const fullPattern = /^(.+?),\s*([^,]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/i;
    const fullMatch = address.match(fullPattern);
    
    if (fullMatch) {
      street_address = fullMatch[1].trim();
      city = fullMatch[2].trim();
      state = fullMatch[3].toUpperCase();
      zip_code = fullMatch[4];
      confidence = 'high';
      notes.push('Full address pattern matched');
    } else {
      // Pattern 2: Address without ZIP
      // "123 Main St, Austin, TX"
      const noZipPattern = /^(.+?),\s*([^,]+),\s*([A-Z]{2})$/i;
      const noZipMatch = address.match(noZipPattern);
      
      if (noZipMatch) {
        street_address = noZipMatch[1].trim();
        city = noZipMatch[2].trim();
        state = noZipMatch[3].toUpperCase();
        confidence = 'medium';
        notes.push('Address pattern without ZIP matched');
      } else {
        // Pattern 3: City, State ZIP
        // "Austin, TX 78701"
        const cityStateZipPattern = /^([^,]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/i;
        const cityStateZipMatch = address.match(cityStateZipPattern);
        
        if (cityStateZipMatch) {
          city = cityStateZipMatch[1].trim();
          state = cityStateZipMatch[2].toUpperCase();
          zip_code = cityStateZipMatch[3];
          confidence = 'medium';
          notes.push('City, State ZIP pattern matched');
        } else {
          // Pattern 4: City, State
          // "Austin, TX"
          const cityStatePattern = /^([^,]+),\s*([A-Z]{2})$/i;
          const cityStateMatch = address.match(cityStatePattern);
          
          if (cityStateMatch) {
            city = cityStateMatch[1].trim();
            state = cityStateMatch[2].toUpperCase();
            confidence = 'medium';
            notes.push('City, State pattern matched');
          } else {
            // Pattern 5: Try to extract ZIP from end
            const zipPattern = /\b(\d{5}(?:-\d{4})?)\s*$/;
            const zipMatch = address.match(zipPattern);
            
            if (zipMatch) {
              zip_code = zipMatch[1];
              const remainingAddress = address.replace(zipPattern, '').trim();
              
              // Try to split remaining into components
              const parts = remainingAddress.split(',').map(p => p.trim());
              if (parts.length >= 2) {
                street_address = parts[0];
                city = parts[1];
                if (parts.length >= 3) {
                  state = parts[2].toUpperCase();
                }
              } else if (parts.length === 1) {
                city = parts[0];
              }
              confidence = 'medium';
              notes.push('ZIP extracted, partial parsing');
            } else {
              // Fallback: try to split by commas
              const parts = address.split(',').map(p => p.trim());
              if (parts.length === 1) {
                // Single part - could be city or street
                if (parts[0].match(/^\d/)) {
                  street_address = parts[0];
                } else {
                  city = parts[0];
                }
                confidence = 'low';
                notes.push('Single component, best guess assignment');
              } else if (parts.length === 2) {
                street_address = parts[0];
                city = parts[1];
                confidence = 'low';
                notes.push('Two components parsed');
              } else {
                street_address = parts[0];
                city = parts[1];
                if (parts[2].length === 2) {
                  state = parts[2].toUpperCase();
                }
                confidence = 'low';
                notes.push('Multiple components, partial parsing');
              }
            }
          }
        }
      }
    }

    // Validate state codes (basic validation)
    if (state && state.length !== 2) {
      notes.push(`Invalid state format: ${state}`);
      confidence = 'low';
    }

    // Validate ZIP codes
    if (zip_code && !zip_code.match(/^\d{5}(?:-\d{4})?$/)) {
      notes.push(`Invalid ZIP format: ${zip_code}`);
      confidence = 'low';
    }

    console.log(`Parsed "${address}" -> Street: ${street_address}, City: ${city}, State: ${state}, ZIP: ${zip_code}, Confidence: ${confidence}`);

  } catch (error) {
    console.error('Error parsing address:', error);
    notes.push(`Parsing error: ${error}`);
    confidence = 'low';
  }

  return {
    street_address,
    city,
    state,
    zip_code,
    parsing_confidence: confidence,
    original_address: address,
    parsing_notes: notes.length > 0 ? notes.join('; ') : undefined
  };
};

export const batchParseAddresses = (addresses: string[]): ParsedAddress[] => {
  return addresses.map(address => parseAddress(address));
};

// Helper function to validate parsed address
export const validateParsedAddress = (parsed: ParsedAddress): boolean => {
  const hasMinimumData = parsed.city || parsed.street_address;
  const hasValidState = !parsed.state || parsed.state.length === 2;
  const hasValidZip = !parsed.zip_code || /^\d{5}(?:-\d{4})?$/.test(parsed.zip_code);
  
  return hasMinimumData && hasValidState && hasValidZip;
};
