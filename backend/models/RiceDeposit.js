const mongoose = require('mongoose');

const riceDepositSchema = new mongoose.Schema({
  date: { 
    type: Date, 
    required: true 
  },
  truckMemo: { 
    type: String, 
    required: true 
  },
  lorryNumber: { 
    type: String, 
    required: true 
  },
  depositGodown: { 
    type: String, 
    required: true 
  },
  variety: { 
    type: String, 
    required: true 
  },
  godownDate: { 
    type: Date, 
    required: true 
  },
  ackNo: { 
    type: String, 
    required: true 
  },
  riceBag: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  riceBagFrk: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  depositWeight: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  depositWeightFrk: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  totalRiceDeposit: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  moisture: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  sampleNumber: { 
    type: String, 
    default: '' 
  },
  gunny: {
    onb: { type: Number, default: 0, min: 0 },
    ss: { type: Number, default: 0, min: 0 },
    swp: { type: Number, default: 0, min: 0 }
  },
  // Track which gunny grades were used from paddy (for downgrade logic)
  gunnyUsedFromPaddy: {
    nb: { type: Number, default: 0, min: 0 }, // NB from paddy becomes ONB in rice
    onb: { type: Number, default: 0, min: 0 }, // ONB from paddy becomes SS in rice
    ss: { type: Number, default: 0, min: 0 },  // SS from paddy becomes SWP in rice
    swp: { type: Number, default: 0, min: 0 }  // SWP from paddy stays SWP in rice
  },
  gunnyBags: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  gunnyWeight: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  paddyReference: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Paddy', 
    required: true 
  },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for efficient querying by date and branch
riceDepositSchema.index({ date: 1, branch_id: 1 });

// Custom validation to check gunny count against paddy reference with downgrade logic
riceDepositSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  
  // Only validate if this is a new document or gunny values have changed
  if (this.isNew || this.isModified('gunnyUsedFromPaddy') || this.isModified('gunny.onb') || this.isModified('gunny.ss') || this.isModified('gunny.swp')) {
    try {
      const Paddy = mongoose.model('Paddy');
      const paddyRecord = await Paddy.findById(this.paddyReference);
      
      if (!paddyRecord) {
        return next(new Error('Referenced paddy record not found'));
      }
      
      // Validate gunny usage from paddy
      const gunnyUsed = this.gunnyUsedFromPaddy || {};
      const paddyGunny = paddyRecord.gunny || {};
      
      // Check if requested gunny usage exceeds available paddy gunny
      if ((gunnyUsed.nb || 0) > (paddyGunny.nb || 0)) {
        return next(new Error(`Cannot use ${gunnyUsed.nb || 0} NB gunny bags. Only ${paddyGunny.nb || 0} available in paddy.`));
      }
      if ((gunnyUsed.onb || 0) > (paddyGunny.onb || 0)) {
        return next(new Error(`Cannot use ${gunnyUsed.onb || 0} ONB gunny bags. Only ${paddyGunny.onb || 0} available in paddy.`));
      }
      if ((gunnyUsed.ss || 0) > (paddyGunny.ss || 0)) {
        return next(new Error(`Cannot use ${gunnyUsed.ss || 0} SS gunny bags. Only ${paddyGunny.ss || 0} available in paddy.`));
      }
      if ((gunnyUsed.swp || 0) > (paddyGunny.swp || 0)) {
        return next(new Error(`Cannot use ${gunnyUsed.swp || 0} SWP gunny bags. Only ${paddyGunny.swp || 0} available in paddy.`));
      }
      
      // Check existing rice deposits for this paddy to ensure total doesn't exceed limit
      const existingRiceDeposits = await mongoose.model('RiceDeposit').find({
        paddyReference: this.paddyReference,
        _id: { $ne: this._id } // Exclude current record if updating
      });
      
      // Calculate total gunny used from paddy across all existing rice deposits
      const totalUsedFromPaddy = existingRiceDeposits.reduce((total, deposit) => {
        const used = deposit.gunnyUsedFromPaddy || {};
        return {
          nb: (total.nb || 0) + (used.nb || 0),
          onb: (total.onb || 0) + (used.onb || 0),
          ss: (total.ss || 0) + (used.ss || 0),
          swp: (total.swp || 0) + (used.swp || 0)
        };
      }, { nb: 0, onb: 0, ss: 0, swp: 0 });
      
      // Check if total usage would exceed available paddy gunny
      const totalAfterThis = {
        nb: (totalUsedFromPaddy.nb || 0) + (gunnyUsed.nb || 0),
        onb: (totalUsedFromPaddy.onb || 0) + (gunnyUsed.onb || 0),
        ss: (totalUsedFromPaddy.ss || 0) + (gunnyUsed.ss || 0),
        swp: (totalUsedFromPaddy.swp || 0) + (gunnyUsed.swp || 0)
      };
      
      if (totalAfterThis.nb > (paddyGunny.nb || 0)) {
        return next(new Error(`Total NB usage (${totalAfterThis.nb}) would exceed available paddy NB (${paddyGunny.nb || 0}). Already used: ${totalUsedFromPaddy.nb || 0}`));
      }
      if (totalAfterThis.onb > (paddyGunny.onb || 0)) {
        return next(new Error(`Total ONB usage (${totalAfterThis.onb}) would exceed available paddy ONB (${paddyGunny.onb || 0}). Already used: ${totalUsedFromPaddy.onb || 0}`));
      }
      if (totalAfterThis.ss > (paddyGunny.ss || 0)) {
        return next(new Error(`Total SS usage (${totalAfterThis.ss}) would exceed available paddy SS (${paddyGunny.ss || 0}). Already used: ${totalUsedFromPaddy.ss || 0}`));
      }
      if (totalAfterThis.swp > (paddyGunny.swp || 0)) {
        return next(new Error(`Total SWP usage (${totalAfterThis.swp}) would exceed available paddy SWP (${paddyGunny.swp || 0}). Already used: ${totalUsedFromPaddy.swp || 0}`));
      }
      
      // Apply downgrade logic to set rice gunny counts
      this.gunny = {
        onb: (gunnyUsed.nb || 0), // NB from paddy becomes ONB in rice
        ss: (gunnyUsed.onb || 0), // ONB from paddy becomes SS in rice
        swp: (gunnyUsed.ss || 0) + (gunnyUsed.swp || 0) // SS from paddy becomes SWP, SWP stays SWP
      };
      
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

// Drop the old unique index if it exists and create the new non-unique index
riceDepositSchema.on('index', function(error) {
  if (error) {
    console.error('Index error:', error);
  }
});

const RiceDeposit = mongoose.model('RiceDeposit', riceDepositSchema);

// Function to ensure proper indexing (call this after model is created)
const ensureIndexes = async () => {
  try {
    const collection = RiceDeposit.collection;
    
    // List of indexes to drop (both unique and non-unique)
    const indexesToDrop = [
      'date_1_branch_id_1',
      'month_1_branch_id_1'
    ];
    
    // Drop problematic indexes if they exist
    for (const indexName of indexesToDrop) {
      try {
        await collection.dropIndex(indexName);
        console.log(`Dropped index: ${indexName}`);
      } catch (dropError) {
        // Index might not exist, which is fine
        console.log(`Index ${indexName} does not exist or already dropped`);
      }
    }
    
    // Create the new non-unique index
    await collection.createIndex({ date: 1, branch_id: 1 });
    console.log('Created new non-unique index on date_1_branch_id_1');
  } catch (error) {
    console.error('Error ensuring indexes:', error);
  }
};

// Export both the model and the ensureIndexes function
module.exports = { RiceDeposit, ensureIndexes }; 