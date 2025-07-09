import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend@2.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AdminNotificationRequest {
  userEmail: string
  userName: string
  userRole: string
  createdBy: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userEmail, userName, userRole, createdBy }: AdminNotificationRequest = await req.json()
    
    const adminEmails = ['matt@austinkunzconstruction.com', 'cradcliff@austinkunzconstruction.com']

    // Send notification to both admins
    const emailPromises = adminEmails.map(adminEmail => 
      resend.emails.send({
        from: 'ConstructPro <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `New External User Account Requires Approval - ${userName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e40af, #f97316); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">ConstructPro</h1>
              <p style="color: white; margin: 5px 0;">External User Approval Required</p>
            </div>
            
            <div style="padding: 30px; background: #f8fafc;">
              <h2 style="color: #1e40af; margin-bottom: 20px;">New External User Account Created</h2>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-top: 0;">User Details:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li style="margin: 10px 0;"><strong>Name:</strong> ${userName}</li>
                  <li style="margin: 10px 0;"><strong>Email:</strong> ${userEmail}</li>
                  <li style="margin: 10px 0;"><strong>Role:</strong> ${userRole}</li>
                  <li style="margin: 10px 0;"><strong>Created by:</strong> ${createdBy}</li>
                  <li style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #f59e0b;">Pending Approval</span></li>
                </ul>
              </div>
              
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #92400e;">Action Required</h4>
                <p style="margin: 0; color: #92400e;">
                  This external user account has been created and is awaiting approval. 
                  Please log in to the ConstructPro admin panel to approve or reject this account.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://con-tech-mobile-hub.lovable.app/admin" 
                   style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Open Admin Panel
                </a>
              </div>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; color: #6b7280; font-size: 14px;">
                <p>This is an automated notification from ConstructPro. External users cannot access the system until approved by an administrator.</p>
              </div>
            </div>
          </div>
        `,
      })
    )

    const results = await Promise.allSettled(emailPromises)
    
    // Check if all emails were sent successfully
    const successful = results.filter(result => result.status === 'fulfilled').length
    const failed = results.filter(result => result.status === 'rejected').length

    console.log(`Admin notification emails sent: ${successful} successful, ${failed} failed`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent: successful,
        emailsFailed: failed,
        adminEmails 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error: any) {
    console.error('Error sending admin notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})