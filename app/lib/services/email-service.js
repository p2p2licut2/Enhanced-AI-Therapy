import nodemailer from 'nodemailer';

/**
 * Serviciu pentru trimiterea email-urilor din aplicație
 */
class EmailService {
  constructor() {
    // Inițializăm transportul de email
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    } else {
      console.warn('SMTP configuration incomplete. Email service will not send real emails.');
    }
    
    this.from = process.env.SMTP_FROM || 'noreply@terapie-ai.ro';
  }
  
  /**
   * Trimite un email
   * @param {Object} options - Opțiunile email-ului
   * @param {string} options.to - Destinatarul email-ului
   * @param {string} options.subject - Subiectul email-ului
   * @param {string} options.text - Conținutul text al email-ului
   * @param {string} options.html - Conținutul HTML al email-ului
   * @returns {Promise<Object>} - Rezultatul trimiterii email-ului
   */
  async sendEmail({ to, subject, text, html }) {
    try {
      console.log('Sending email to:', to);
      console.log('Email subject:', subject);
      console.log('Environment:', process.env.NODE_ENV);
      console.log('USE_ETHEREAL setting:', process.env.USE_ETHEREAL);
      
      // Verificăm dacă suntem în mediul de dezvoltare și utilizăm Ethereal pentru testare
      if (process.env.NODE_ENV === 'development' && process.env.USE_ETHEREAL === 'true') {
        console.log('Using Ethereal for email testing');
        
        try {
          // Creăm un cont de test Ethereal pentru a vizualiza email-urile în browser
          const testAccount = await nodemailer.createTestAccount();
          console.log('Created Ethereal test account:', testAccount.user);
          
          // Creăm un transporter Ethereal
          const testTransporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass,
            },
          });
          
          // Trimitem email-ul folosind Ethereal
          const info = await testTransporter.sendMail({
            from: `Terapie AI <${this.from}>`,
            to,
            subject,
            text,
            html,
          });
          
          // Returnăm URL-ul de previzualizare pentru email
          const previewUrl = nodemailer.getTestMessageUrl(info);
          console.log(`Email sent successfully. Preview URL: ${previewUrl}`);
          return {
            success: true,
            messageId: info.messageId,
            previewUrl,
          };
        } catch (etherealError) {
          console.error('Error with Ethereal email:', etherealError);
          throw etherealError;
        }
      } else if (process.env.NODE_ENV === 'development') {
        // În dezvoltare, dacă nu folosim Ethereal, doar logăm conținutul
        console.log('Development mode without Ethereal - logging email content:');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('Text content:', text);
        console.log('HTML content length:', html ? html.length : 0);
        
        return {
          success: true,
          messageId: 'dev-mode-' + Date.now(),
          previewUrl: null,
          devMode: true,
        };
      }
      
      // Verificăm dacă transporterul a fost configurat
      if (!this.transporter) {
        console.error('Email transporter not configured');
        return {
          success: false,
          error: 'Email service not configured',
          devMode: process.env.NODE_ENV === 'development'
        };
      }
      
      // Verificăm configurarea transporterului
      console.log('SMTP Configuration:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        user: process.env.SMTP_USER ? '***configured***' : '***missing***',
        from: this.from,
      });
      
      // Trimitem email-ul folosind transporterul configurat
      const info = await this.transporter.sendMail({
        from: `Terapie AI <${this.from}>`,
        to,
        subject,
        text,
        html,
      });
      
      console.log('Email sent successfully with configured transporter:', info.messageId);
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }


  
  /**
   * Trimite un email de verificare
   * @param {string} email - Adresa de email
   * @param {string} name - Numele utilizatorului
   * @param {string} token - Token-ul de verificare
   * @returns {Promise<Object>} - Rezultatul trimiterii email-ului
   */
  async sendVerificationEmail(email, name, token) {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Adăugăm parametrul nopreload pentru a evita preîncărcarea linkurilor
    const verificationLink = `${baseUrl}/auth/verify?token=${token}&nopreload=true`;
    
    const subject = 'Verifică-ți adresa de email - Terapie AI';
    
    const text = `
      Salut ${name || 'utilizator'},

      Mulțumim pentru înregistrarea pe platforma Terapie AI!
      
      Te rugăm să confirmi adresa de email accesând următorul link:
      ${verificationLink}
      
      IMPORTANT: Dacă folosești o aplicație de email care preîncarcă linkurile, te rugăm să deschizi link-ul într-o fereastră nouă de browser.
      
      Acest link va expira în 48 de ore.
      
      Dacă nu ai solicitat acest email, te rugăm să îl ignori.
      
      Cu stimă,
      Echipa Terapie AI
    `;

    // Generăm unsubscribe link pentru GDPR compliance
    const unsubscribeLink = `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}&type=verification`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${baseUrl}/logo.png" alt="Terapie AI" style="max-width: 120px;">
        </div>
        
        <div style="background-color: #f7f4f0; padding: 30px; border-radius: 8px;">
          <h2 style="color: #c17f65; margin-top: 0;">Verifică-ți adresa de email</h2>
          
          <p>Salut ${name || 'utilizator'},</p>
          
          <p>Mulțumim pentru înregistrarea pe platforma <strong>Terapie AI</strong>!</p>
          
          <p>Pentru a activa contul tău și a începe conversațiile cu terapeutul AI, te rugăm să confirmi adresa de email:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #d2a38a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;" target="_blank" rel="noopener noreferrer">
              Confirmă adresa de email
            </a>
          </div>
          
          <div style="background-color: #ffffe0; border-left: 4px solid #e2d562; padding: 12px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              <strong>Important:</strong> Unele servicii de email pot preîncărca linkurile. Pentru a evita probleme, 
              te rugăm să deschizi linkul de confirmare într-o fereastră nouă de browser sau să faci click dreapta 
              și să alegi "Deschide într-o fereastră nouă".
            </p>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            Dacă butonul nu funcționează, copiază și lipește următorul link în browser:<br>
            <a href="${verificationLink}" style="color: #d2a38a; word-break: break-all;">${verificationLink}</a>
          </p>
          
          <p style="font-size: 14px; color: #666;">
            Acest link va expira în 48 de ore.
          </p>
          
          <p style="margin-top: 30px; margin-bottom: 0;">
            Cu stimă,<br>
            Echipa Terapie AI
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
          <p>Dacă nu ai solicitat acest email, te rugăm să îl ignori.</p>
          <p>
            Acest email a fost trimis către ${email}. 
            <a href="${unsubscribeLink}" style="color: #999; text-decoration: underline;" target="_blank" rel="noopener noreferrer">Dezabonare</a>
          </p>
          <p>&copy; ${new Date().getFullYear()} Terapie AI. Toate drepturile rezervate.</p>
          <p>
            <strong>Date de contact:</strong> Terapie AI, Calea Exemplu, Nr. 123, București<br>
            contact@terapie-ai.ro | 0700 000 000
          </p>
        </div>
      </div>
    `;
    
    return this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }

  /**
   * Trimite un email pentru resetarea parolei
   * @param {string} email - Adresa de email
   * @param {string} name - Numele utilizatorului
   * @param {string} token - Token-ul de resetare
   * @returns {Promise<Object>} - Rezultatul trimiterii email-ului
   */
  async sendPasswordResetEmail(email, name, token) {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/auth/reset-password?token=${token}`;
    
    // Generăm unsubscribe link pentru GDPR compliance
    const unsubscribeLink = `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}&type=security`;
    
    const subject = 'Resetare parolă - Terapie AI';
    
    const text = `
      Salut ${name || 'utilizator'},

      Ai solicitat resetarea parolei pentru contul tău de pe platforma Terapie AI.
      
      Pentru a reseta parola, accesează următorul link:
      ${resetLink}
      
      Acest link va expira în 1 oră.
      
      Dacă nu ai solicitat resetarea parolei, te rugăm să ignori acest email și să-ți verifici securitatea contului.
      
      Cu stimă,
      Echipa Terapie AI
    `;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${baseUrl}/logo.png" alt="Terapie AI" style="max-width: 120px;">
        </div>
        
        <div style="background-color: #f7f4f0; padding: 30px; border-radius: 8px;">
          <h2 style="color: #c17f65; margin-top: 0;">Resetare parolă</h2>
          
          <p>Salut ${name || 'utilizator'},</p>
          
          <p>Ai solicitat resetarea parolei pentru contul tău de pe platforma <strong>Terapie AI</strong>.</p>
          
          <p>Pentru a seta o nouă parolă, te rugăm să accesezi următorul link:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #d2a38a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Resetează parola
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            Dacă butonul nu funcționează, copiază și lipește următorul link în browser:<br>
            <a href="${resetLink}" style="color: #d2a38a;">${resetLink}</a>
          </p>
          
          <p style="font-size: 14px; color: #666;">
            Acest link va expira în 1 oră.
          </p>
          
          <p style="font-size: 14px; color: #666;">
            Dacă nu ai solicitat resetarea parolei, te rugăm să ignori acest email și să îți verifici securitatea contului.
          </p>
          
          <p style="margin-top: 30px; margin-bottom: 0;">
            Cu stimă,<br>
            Echipa Terapie AI
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
          <p>
            Acest email a fost trimis către ${email} deoarece cineva a solicitat resetarea parolei pentru contul tău.
            <a href="${unsubscribeLink}" style="color: #999; text-decoration: underline;">Dezabonare</a> de la notificările de securitate
          </p>
          <p>&copy; ${new Date().getFullYear()} Terapie AI. Toate drepturile rezervate.</p>
          <p>
            <strong>Date de contact:</strong> Terapie AI, Calea Exemplu, Nr. 123, București<br>
            contact@terapie-ai.ro | 0700 000 000
          </p>
        </div>
      </div>
    `;
    
    return this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }

  /**
   * Trimite un email de confirmare după modificarea parolei
   * @param {string} email - Adresa de email
   * @param {string} name - Numele utilizatorului
   * @returns {Promise<Object>} - Rezultatul trimiterii email-ului
   */
  async sendPasswordChangedEmail(email, name) {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Generăm unsubscribe link pentru GDPR compliance
    const unsubscribeLink = `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}&type=security`;
    
    const subject = 'Parola a fost modificată - Terapie AI';
    
    const text = `
      Salut ${name || 'utilizator'},

      Parola contului tău Terapie AI a fost modificată cu succes.
      
      Dacă nu tu ai făcut această modificare, te rugăm să ne contactezi imediat la adresa de email support@terapie-ai.ro sau să-ți resetezi parola accesând:
      ${baseUrl}/auth/forgot-password
      
      Cu stimă,
      Echipa Terapie AI
    `;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${baseUrl}/logo.png" alt="Terapie AI" style="max-width: 120px;">
        </div>
        
        <div style="background-color: #f7f4f0; padding: 30px; border-radius: 8px;">
          <h2 style="color: #c17f65; margin-top: 0;">Parola a fost modificată</h2>
          
          <p>Salut ${name || 'utilizator'},</p>
          
          <p>Parola contului tău <strong>Terapie AI</strong> a fost modificată cu succes.</p>
          
          <div style="background-color: #edf2f7; border-left: 4px solid #4299e1; padding: 12px 20px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #2c5282; font-weight: 600;">Notă de securitate</p>
            <p style="margin-top: 6px; margin-bottom: 0; color: #2d3748;">
              Dacă nu tu ai făcut această modificare, te rugăm să ne contactezi imediat la adresa de email 
              <a href="mailto:support@terapie-ai.ro" style="color: #4299e1;">support@terapie-ai.ro</a> 
              sau să-ți resetezi parola.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/auth/forgot-password" style="background-color: #d2a38a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Resetează parola
            </a>
          </div>
          
          <p style="margin-top: 30px; margin-bottom: 0;">
            Cu stimă,<br>
            Echipa Terapie AI
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
          <p>
            Acest email a fost trimis către ${email} ca o măsură de securitate.
            <a href="${unsubscribeLink}" style="color: #999; text-decoration: underline;">Dezabonare</a> de la notificările de securitate
          </p>
          <p>&copy; ${new Date().getFullYear()} Terapie AI. Toate drepturile rezervate.</p>
          <p>
            <strong>Date de contact:</strong> Terapie AI, Calea Exemplu, Nr. 123, București<br>
            contact@terapie-ai.ro | 0700 000 000
          </p>
        </div>
      </div>
    `;
    
    return this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }
}

// Exportăm o instanță singleton a serviciului
export const emailService = new EmailService();