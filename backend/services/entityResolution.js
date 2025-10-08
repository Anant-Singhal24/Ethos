const stringSimilarity = require('string-similarity');
const Entity = require('../models/Entity');

class EntityResolutionService {
  /**
   * Resolve entity across multiple data sources
   */
  async resolveEntity(identifiers) {
    const matches = [];
    const queries = [];
    
    // Build query for each available identifier
    if (identifiers.student_id) {
      queries.push({ 'identifiers.student_id': identifiers.student_id });
    }
    if (identifiers.staff_id) {
      queries.push({ 'identifiers.staff_id': identifiers.staff_id });
    }
    if (identifiers.email) {
      queries.push({ 'identifiers.email': identifiers.email });
    }
    if (identifiers.card_id) {
      queries.push({ 'identifiers.card_id': identifiers.card_id });
    }
    if (identifiers.device_hash) {
      queries.push({ 'identifiers.device_hash': identifiers.device_hash });
    }
    if (identifiers.face_id) {
      queries.push({ 'identifiers.face_id': identifiers.face_id });
    }
    
    // Search for exact matches
    if (queries.length > 0) {
      const exactMatches = await Entity.find({ $or: queries });
      if (exactMatches.length > 0) {
        return {
          resolved: true,
          entity: exactMatches[0],
          confidence: 1.0,
          method: 'exact_match'
        };
      }
    }
    
    // Fuzzy name matching if name is provided
    if (identifiers.name) {
      const nameMatches = await this.fuzzyNameMatch(identifiers.name);
      if (nameMatches.length > 0 && nameMatches[0].confidence > 0.8) {
        return {
          resolved: true,
          entity: nameMatches[0].entity,
          confidence: nameMatches[0].confidence,
          method: 'fuzzy_name_match'
        };
      }
    }
    
    return {
      resolved: false,
      entity: null,
      confidence: 0,
      method: 'no_match'
    };
  }
  
  /**
   * Fuzzy name matching using string similarity
   */
  async fuzzyNameMatch(searchName) {
    const allEntities = await Entity.find({ 'profile.fullName': { $exists: true } });
    const matches = [];
    
    const normalizedSearch = this.normalizeName(searchName);
    
    for (const entity of allEntities) {
      const normalizedEntity = this.normalizeName(entity.profile.fullName);
      const similarity = stringSimilarity.compareTwoStrings(normalizedSearch, normalizedEntity);
      
      if (similarity > 0.6) {
        matches.push({
          entity,
          confidence: similarity,
          score: similarity
        });
      }
      
      // Check name variants
      if (entity.identifiers.nameVariants) {
        for (const variant of entity.identifiers.nameVariants) {
          const normalizedVariant = this.normalizeName(variant);
          const variantSimilarity = stringSimilarity.compareTwoStrings(normalizedSearch, normalizedVariant);
          
          if (variantSimilarity > similarity && variantSimilarity > 0.6) {
            const existingIndex = matches.findIndex(m => m.entity._id.equals(entity._id));
            if (existingIndex >= 0) {
              matches[existingIndex].confidence = variantSimilarity;
              matches[existingIndex].score = variantSimilarity;
            } else {
              matches.push({
                entity,
                confidence: variantSimilarity,
                score: variantSimilarity
              });
            }
          }
        }
      }
    }
    
    // Sort by confidence
    matches.sort((a, b) => b.confidence - a.confidence);
    
    return matches;
  }
  
  /**
   * Normalize name for comparison
   */
  normalizeName(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ');
  }
  
  /**
   * Link records across sources
   */
  async linkRecords(entityId, newIdentifier, sourceType, confidence = 1.0) {
    const entity = await Entity.findById(entityId);
    
    if (!entity) {
      throw new Error('Entity not found');
    }
    
    // Update entity with new identifier
    const resolvedEntry = {
      sourceId: newIdentifier,
      sourceType,
      confidence,
      timestamp: new Date()
    };
    
    entity.resolvedEntities.push(resolvedEntry);
    await entity.save();
    
    return entity;
  }
  
  /**
   * Merge duplicate entities
   */
  async mergeEntities(primaryEntityId, secondaryEntityId) {
    const primary = await Entity.findById(primaryEntityId);
    const secondary = await Entity.findById(secondaryEntityId);
    
    if (!primary || !secondary) {
      throw new Error('One or both entities not found');
    }
    
    // Merge identifiers
    Object.keys(secondary.identifiers).forEach(key => {
      if (secondary.identifiers[key] && !primary.identifiers[key]) {
        primary.identifiers[key] = secondary.identifiers[key];
      }
    });
    
    // Merge resolved entities
    primary.resolvedEntities = [
      ...primary.resolvedEntities,
      ...secondary.resolvedEntities
    ];
    
    // Update last seen if secondary is more recent
    if (secondary.lastSeen && 
        (!primary.lastSeen.timestamp || 
         secondary.lastSeen.timestamp > primary.lastSeen.timestamp)) {
      primary.lastSeen = secondary.lastSeen;
    }
    
    await primary.save();
    
    // Mark secondary as inactive
    secondary.isActive = false;
    await secondary.save();
    
    return primary;
  }
}

module.exports = new EntityResolutionService();
