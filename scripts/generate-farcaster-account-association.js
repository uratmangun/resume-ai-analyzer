#!/usr/bin/env node

require('dotenv/config');
const { writeFileSync, readFileSync } = require('fs');
const { join } = require('path');
const { 
  encodeHeader, 
  encodePayload, 
  decode
} = require('@farcaster/jfs');

/**
 * Script to generate Farcaster account association for Mini App manifest
 * 
 * The account association verifies domain ownership to a Farcaster account
 * using a JSON Farcaster Signature (JFS) format.
 * 
 * IMPORTANT: This script prepares the data structure but you'll need to:
 * 1. Use the official Warpcast Mini App Manifest Tool at:
 *    https://farcaster.xyz/~/developers/new
 * 2. Or implement signing with your Farcaster custody address private key
 */

class FarcasterAccountAssociationGenerator {
  constructor(domain) {
    this.domain = domain;
    this.manifestPath = join(process.cwd(), 'public/.well-known/farcaster.json');
  }

  /**
   * Create the payload that needs to be signed
   */
  createPayload() {
    return {
      domain: this.domain
    };
  }

  /**
   * Encode payload using @farcaster/jfs
   */
  encodePayload() {
    const payload = this.createPayload();
    return encodePayload(payload);
  }

  /**
   * Create JFS header structure (needs FID and custody key)
   */
  createHeaderStructure(fid, custodyAddress) {
    return {
      fid: fid,
      type: "custody",
      key: custodyAddress
    };
  }

  /**
   * Encode header using @farcaster/jfs
   */
  encodeHeader(fid, custodyAddress) {
    const header = this.createHeaderStructure(fid, custodyAddress);
    return encodeHeader(header);
  }

  /**
   * Generate account association data structure
   * Note: This creates the structure but requires manual signing
   */
  generateAccountAssociation(fid, custodyAddress) {
    const encodedHeader = this.encodeHeader(fid, custodyAddress);
    const encodedPayload = this.encodePayload();
    
    // The data that needs to be signed is header.payload (JFS specification)
    const dataToSign = encodedHeader + '.' + encodedPayload;

    return {
      header: encodedHeader,
      payload: encodedPayload,
      dataToSign,
      instructions: [
        "1. Use your Farcaster custody address private key to sign the dataToSign",
        "2. Encode the signature as base64",
        "3. Or use the official Warpcast tool: https://farcaster.xyz/~/developers/new",
        `4. Make sure the domain matches exactly: ${this.domain}`
      ]
    };
  }

  /**
   * Update the farcaster.json manifest with new account association
   */
  updateManifest(accountAssociation) {
    try {
      const manifestData = JSON.parse(readFileSync(this.manifestPath, 'utf8'));
      
      // Update account association
      manifestData.accountAssociation = accountAssociation;
      
      // Update domain references in miniapp (replace domain in image URLs while preserving paths)
      if (manifestData.miniapp) {
        const baseUrl = `https://${this.domain}`;
        manifestData.miniapp.homeUrl = baseUrl;
        manifestData.miniapp.webhookUrl = `${baseUrl}/api/webhook`;
        
        // Update image URLs by replacing domain but preserving the path
        if (manifestData.miniapp.iconUrl) {
          const iconPath = new URL(manifestData.miniapp.iconUrl).pathname;
          manifestData.miniapp.iconUrl = `${baseUrl}${iconPath}`;
        }
        
        if (manifestData.miniapp.imageUrl) {
          const imagePath = new URL(manifestData.miniapp.imageUrl).pathname;
          manifestData.miniapp.imageUrl = `${baseUrl}${imagePath}`;
        }
        
        if (manifestData.miniapp.splashImageUrl) {
          const splashPath = new URL(manifestData.miniapp.splashImageUrl).pathname;
          manifestData.miniapp.splashImageUrl = `${baseUrl}${splashPath}`;
        }
      }

      // Write updated manifest
      writeFileSync(
        this.manifestPath, 
        JSON.stringify(manifestData, null, 2), 
        'utf8'
      );

      console.log('✅ Updated farcaster.json manifest');
    } catch (error) {
      console.error('❌ Error updating manifest:', error);
    }
  }

  /**
   * Validate current manifest structure
   */
  validateManifest() {
    try {
      const manifestData = JSON.parse(readFileSync(this.manifestPath, 'utf8'));
      
      const hasAccountAssociation = manifestData.accountAssociation &&
        manifestData.accountAssociation.header &&
        manifestData.accountAssociation.payload &&
        manifestData.accountAssociation.signature;

      const hasMiniapp = manifestData.miniapp &&
        manifestData.miniapp.version &&
        manifestData.miniapp.name &&
        manifestData.miniapp.homeUrl;

      if (!hasAccountAssociation) {
        console.log('❌ Missing or incomplete accountAssociation');
      }

      if (!hasMiniapp) {
        console.log('❌ Missing or incomplete miniapp config');
      }

      return hasAccountAssociation && hasMiniapp;
    } catch (error) {
      console.error('❌ Error validating manifest:', error);
      return false;
    }
  }

  /**
   * Decode base64 data for inspection
   */
  decodeAccountAssociation() {
    try {
      const manifestData = JSON.parse(readFileSync(this.manifestPath, 'utf8'));
      const { accountAssociation } = manifestData;

      if (!accountAssociation) {
        console.log('❌ No account association found');
        return;
      }

      console.log('🔍 Decoded Account Association Data:\n');

      // Decode using @farcaster/jfs
      const decoded = decode(accountAssociation);
      console.log('Header:', decoded.header);
      console.log('Payload:', decoded.payload);

      // Show signature (already encoded)
      if (accountAssociation.signature) {
        console.log('Signature:', accountAssociation.signature);
      }

    } catch (error) {
      console.error('❌ Error decoding account association:', error);
    }
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);
  
  // Default to 'generate' command when no arguments provided
  const command = args[0] || 'generate';
  const domain = args[1] || process.env.NEXT_PUBLIC_APP_DOMAIN || 'example.com';
  const generator = new FarcasterAccountAssociationGenerator(domain);

  switch (command) {
    case 'prepare': {
      const domain = args[1] || process.env.NEXT_PUBLIC_APP_DOMAIN;
      if (!domain) {
        console.error('❌ Domain required. Provide as argument or set NEXT_PUBLIC_APP_DOMAIN in .env');
        return;
      }

      const fid = process.env.FARCASTER_FID;
      const custodyAddress = process.env.FARCASTER_CUSTODY_ADDRESS;

      if (!fid || !custodyAddress) {
        console.error('❌ Missing environment variables:');
        console.error('   FARCASTER_FID=' + (fid || 'NOT_SET'));
        console.error('   FARCASTER_CUSTODY_ADDRESS=' + (custodyAddress || 'NOT_SET'));
        console.error('\n💡 Set these in your .env file or use the Warpcast tool:');
        console.error('   https://farcaster.xyz/~/developers/new');
        return;
      }

      console.log(`🔧 Preparing account association for domain: ${domain}`);
      console.log(`📋 Using FID: ${fid}`);
      console.log(`📋 Using custody address: ${custodyAddress}\n`);
      
      const data = generator.generateAccountAssociation(parseInt(fid), custodyAddress);
      
      console.log('📄 Generated data:');
      console.log('Header (base64):', data.header);
      console.log('Payload (base64):', data.payload);
      console.log('Data to sign:', data.dataToSign);
      console.log('\n📝 Next steps:');
      data.instructions.forEach(instruction => console.log(`   ${instruction}`));
      break;
    }

    case 'generate': {
      const domain = process.env.NEXT_PUBLIC_APP_DOMAIN;
      const fid = process.env.FARCASTER_FID;
      const custodyAddress = process.env.FARCASTER_CUSTODY_ADDRESS;
      const privateKey = process.env.FARCASTER_CUSTODY_PRIVATE_KEY;

      if (!domain || !fid || !custodyAddress || !privateKey) {
        console.error('❌ Missing required environment variables:');
        console.error('   NEXT_PUBLIC_APP_DOMAIN=' + (domain || 'NOT_SET'));
        console.error('   FARCASTER_FID=' + (fid || 'NOT_SET'));
        console.error('   FARCASTER_CUSTODY_ADDRESS=' + (custodyAddress || 'NOT_SET'));
        console.error('   FARCASTER_CUSTODY_PRIVATE_KEY=' + (privateKey ? 'SET' : 'NOT_SET'));
        console.error('\n💡 Set these in your .env file');
        return;
      }

      console.log(`🔧 Generating account association for domain: ${domain}`);
      console.log(`📋 Using FID: ${fid}`);
      console.log(`📋 Using custody address: ${custodyAddress}\n`);

      // Use ethers v6 Wallet to sign per EIP-191 (personal_sign)
      const { Wallet } = require('ethers');
      const wallet = new Wallet(privateKey);
      const walletAddress = wallet.address;

      if (walletAddress.toLowerCase() !== custodyAddress.toLowerCase()) {
        console.error('❌ FARCASTER_CUSTODY_PRIVATE_KEY does not match FARCASTER_CUSTODY_ADDRESS');
        console.error(`   Derived from private key: ${walletAddress}`);
        console.error(`   Provided address       : ${custodyAddress}`);
        console.error('   Please ensure they refer to the same custody account.');
        return;
      }

      // Generate the association data using the wallet-derived address
      const tempGenerator = new FarcasterAccountAssociationGenerator(domain);
      const data = tempGenerator.generateAccountAssociation(parseInt(fid), walletAddress);

      // JFS requires signing the literal "header.payload" string with EIP-191
      const message = data.dataToSign;
      const sigHex = await wallet.signMessage(message); // 0x + 130 hex chars

      // The JFS signature field is base64url of the ASCII hex string (including 0x)
      const encodedSignature = Buffer.from(sigHex, 'utf8').toString('base64url');

      const accountAssociation = {
        header: data.header,
        payload: data.payload,
        signature: encodedSignature,
      };

      console.log('✅ Generated account association:');
      console.log('Header:', accountAssociation.header);
      console.log('Payload:', accountAssociation.payload);
      console.log('Signature:', accountAssociation.signature);

      // Update the manifest
      tempGenerator.updateManifest(accountAssociation);
      
      console.log('\n🎉 Successfully updated farcaster.json using ethers v6 EIP-191 signature!');
      break;
    }

    case 'validate': {
      console.log('🔍 Validating current manifest...\n');
      const isValid = generator.validateManifest();
      
      if (isValid) {
        console.log('✅ Manifest is valid');
      } else {
        console.log('❌ Manifest validation failed');
      }
      break;
    }

    case 'decode': {
      generator.decodeAccountAssociation();
      break;
    }

    case 'update': {
      if (args.length < 5) {
        console.error('❌ Usage: update <domain> <header> <payload> <signature>');
        return;
      }

      const [, domain, header, payload, signature] = args;
      const accountAssociation = {
        header,
        payload,
        signature
      };

      console.log(`🔄 Updating manifest for domain: ${domain}`);
      generator.updateManifest(accountAssociation);
      break;
    }

    default:
      console.error(`❌ Unknown command: ${command}`);
  }
}

// Run the script when executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { FarcasterAccountAssociationGenerator };
