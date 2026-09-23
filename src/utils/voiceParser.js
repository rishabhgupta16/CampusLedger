/**
 * Voice Transaction Parser
 * Parses natural conversational student speech into structured transaction data.
 * Pure logic, independent of browser speech recognition APIs.
 */

import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories.js';
import { getCurrentDateISO, formatDateToLocalISO } from './dateUtils.js';

// Keyword mappings for intelligent student-category matching
const CATEGORY_KEYWORDS = {
  'canteen_food': ['canteen', 'lunch', 'dinner', 'breakfast', 'food', 'samosa', 'maggi', 'roll', 'burger', 'pizza', 'dosa', 'thali', 'mess'],
  'tea_coffee': ['tea', 'chai', 'coffee', 'tapri', 'beverage', 'cafe', 'starbucks', 'ccd'],
  'travel': ['travel', 'auto', 'metro', 'bus', 'cab', 'uber', 'ola', 'rapido', 'train', 'petrol', 'fuel'],
  'college': ['college', 'fees', 'exam fee', 'id card', 'fine', 'form', 'assignment print', 'photocopy'],
  'books_notes': ['book', 'books', 'notes', 'stationery', 'pen', 'register', 'xerox', 'printout'],
  'hostel_pg': ['hostel', 'pg', 'rent', 'room rent', 'landlord', 'electricity bill'],
  'gym': ['gym', 'fitness', 'gym membership', 'trainer', 'workout'],
  'supplements': ['whey', 'protein', 'creatine', 'supplement', 'supplements', 'bcaa', 'peanut butter'],
  'diet_meals': ['diet', 'gym diet', 'eggs', 'chicken', 'paneer', 'oats', 'salad', 'boiled eggs', 'banana shake'],
  'shopping': ['shopping', 'clothes', 'shirt', 'pants', 'shoes', 'myntra', 'amazon', 'flipkart'],
  'entertainment': ['movie', 'cinema', 'netflix', 'game', 'gaming', 'bowling', 'party'],
  'outings': ['outing', 'trip', 'mumbai', 'goa', 'hills', 'drive', 'hangout', 'night out'],
  'subscriptions': ['subscription', 'spotify', 'prime', 'youtube', 'apple music', 'hotstar'],
  'recharge': ['recharge', 'jio', 'airtel', 'vi', 'wifi', 'data pack'],
  'medical': ['medicine', 'doctor', 'clinic', 'pharmacy', 'medical', 'hospital'],
  'personal_care': ['salon', 'haircut', 'barber', 'face wash', 'grooming', 'shampoo'],
};

export function parseVoiceTranscript(rawTranscript = '') {
  if (!rawTranscript || typeof rawTranscript !== 'string') {
    return null;
  }

  const text = rawTranscript.toLowerCase().trim();

  // 1. Detect Transaction Type (default to expense for student transactions)
  let type = 'expense';
  const incomeTriggers = ['received', 'got', 'income', 'pocket money', 'allowance', 'earned', 'credited', 'freelance', 'salary'];
  if (incomeTriggers.some((word) => text.includes(word))) {
    type = 'income';
  }

  // 2. Extract Amount
  // Matches expressions like "80 rupees", "rs 120", "250 rs", "spent 100", "₹500", "500"
  let amount = null;
  const amountRegex = /(?:rs\.?|inr|rupees|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:rs\.?|rupees|bucks)?/i;
  const matches = text.match(amountRegex);

  if (matches && matches[1]) {
    const cleanNum = matches[1].replace(/,/g, '');
    const parsedNum = parseFloat(cleanNum);
    if (!isNaN(parsedNum) && parsedNum > 0) {
      amount = parsedNum;
    }
  }

  // 3. Detect Category
  let matchedCategory = type === 'income' ? 'Monthly Pocket Money / Allowance' : 'Canteen / Food';

  if (type === 'expense') {
    let foundCategory = null;
    for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some((kw) => text.includes(kw))) {
        const catObj = EXPENSE_CATEGORIES.find((c) => c.id === catId);
        if (catObj) {
          foundCategory = catObj.name;
          break;
        }
      }
    }
    if (foundCategory) {
      matchedCategory = foundCategory;
    }
  } else {
    if (text.includes('freelance') || text.includes('project') || text.includes('part time')) {
      matchedCategory = 'Part-Time / Freelancing';
    } else if (text.includes('scholarship')) {
      matchedCategory = 'Scholarship / Grant';
    } else if (text.includes('gift') || text.includes('reward')) {
      matchedCategory = 'Gifts & Rewards';
    }
  }

  // 4. Detect Date
  let date = getCurrentDateISO();
  if (text.includes('yesterday')) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    // Local-date string, not toISOString() — avoids a UTC-conversion day
    // shift for IST users (see formatDateToLocalISO's doc comment).
    date = formatDateToLocalISO(yesterday);
  }

  // 5. Clean Description
  // Create an informative description from the transcript
  let description = rawTranscript.charAt(0).toUpperCase() + rawTranscript.slice(1);

  return {
    rawTranscript,
    type,
    amount,
    category: matchedCategory,
    description,
    date,
    confidence: amount ? 'high' : 'low',
  };
}
