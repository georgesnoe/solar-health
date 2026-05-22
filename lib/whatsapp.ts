export async function sendWhatsAppAlert(
  phone: string,
  userName: string,
  percentage: number,
  expectedKwh: string,
  actualKwh: string,
  timestamp: string
): Promise<{ success: boolean; error?: string }> {
  const gowaUrl = process.env.GOWA_URL
  const gowaUsername = process.env.GOWA_USERNAME
  const gowaPassword = process.env.GOWA_PASSWORD
  const gowaDeviceId = process.env.GOWA_DEVICE_ID

  if (!gowaUrl || !gowaUsername || !gowaPassword || !gowaDeviceId) {
    console.warn("WhatsApp: GOWA env vars not configured")
    return { success: false, error: "GOWA not configured" }
  }

  if (!phone) {
    return { success: false, error: "No phone number" }
  }

  const jid = phone.includes("@") ? phone : `${phone}@s.whatsapp.net`

  const message = `🔋 *Solar-Health - Alerte Production*\n\nBonjour ${userName},\n\nVotre production solaire est anormalement basse :\n\n- 📉 Baisse : ${percentage}%\n- ⚡ Production attendue : ${expectedKwh} kWh\n- ⚡ Production réelle : ${actualKwh} kWh\n- 🕐 ${timestamp}\n\nVeuillez vérifier vos panneaux.`

  try {
    const basicAuth = Buffer.from(`${gowaUsername}:${gowaPassword}`).toString("base64")

    const response = await fetch(`${gowaUrl.replace(/\/$/, "")}/send/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Device-Id": gowaDeviceId,
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        phone: jid,
        message,
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      console.error("WhatsApp API error:", response.status, body)
      return { success: false, error: `API error: ${response.status}` }
    }

    return { success: true }
  } catch (error) {
    console.error("WhatsApp send failed:", error)
    return { success: false, error: String(error) }
  }
}
