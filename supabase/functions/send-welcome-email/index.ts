import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend@2.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WelcomeEmailRequest {
  userEmail: string
  userName: string
  temporaryPassword: string
  userRole: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userEmail, userName, temporaryPassword, userRole }: WelcomeEmailRequest = await req.json()

    const loginUrl = `${Deno.env.get('SUPABASE_URL')?.replace('https://jjmedlilkxmrbacoitio.supabase.co', 'https://jjmedlilkxmrbacoitio.lovable.app')}/auth`

    const emailResponse = await resend.emails.send({
      from: 'ConstructPro <onboarding@resend.dev>',
      to: [userEmail],
      subject: 'Welcome to ConstructPro - Your Account Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af, #f97316); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">ConstructPro</h1>
            <p style="color: white; margin: 5px 0;">Professional Construction Management</p>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e40af; margin-bottom: 20px;">Welcome to ConstructPro!</h2>
            
            <p style="margin-bottom: 20px;">
              Hello ${userName},<br><br>
              Your ConstructPro account has been created successfully. You've been assigned the role of <strong>${userRole}</strong> 
              and will have access to relevant project information once your account is approved by our administrators.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #1e40af;">
              <h3 style="margin-top: 0; color: #1e40af;">Your Login Credentials</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="margin: 10px 0;"><strong>Email:</strong> ${userEmail}</li>
                <li style="margin: 10px 0;"><strong>Temporary Password:</strong> 
                  <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${temporaryPassword}</code>
                </li>
              </ul>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
              <h4 style="margin: 0 0 10px 0; color: #92400e;">Important Security Notice</h4>
              <p style="margin: 0; color: #92400e;">
                This is a temporary password. You will be required to change it when you first log in. 
                Please keep this information secure and do not share it with others.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Login to ConstructPro
              </a>
            </div>
            
            <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h4 style="margin: 0 0 10px 0; color: #0369a1;">What happens next?</h4>
              <ol style="margin: 0; color: #0369a1;">
                <li>Your account is currently pending approval by our administrators</li>
                <li>You'll receive a confirmation email once your account is approved</li>
                <li>After approval, you can access all assigned projects and tasks</li>
              </ol>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; color: #6b7280; font-size: 14px;">
              <p><strong>Need help?</strong> Contact your project manager or email support for assistance.</p>
              <p>This email was sent automatically from ConstructPro. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      `,
    })

    console.log('Welcome email sent successfully:', emailResponse)

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResponse.data?.id,
        recipient: userEmail 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error: any) {
    console.error('Error sending welcome email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})