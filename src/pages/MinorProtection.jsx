import PageLayout from '../components/PageLayout';

export default function MinorProtection() {
  const text = { color: 'var(--text-light)' };
  const heading = { color: 'var(--text)' };
  const link = { color: 'var(--link-color)' };

  return (
    <PageLayout hero={{ icon: 'fa-child', title: '未成年人个人信息保护说明', subtitle: '更新及生效日期：2026年10月3日 · 版本 2026.10' }}>
      <div className="card space-y-4 text-sm leading-relaxed break-words" style={text}>
        <p><strong style={heading}>本说明是《隐私政策》的补充，不是允许未成年人使用服务的例外。英文为正式版本，中文为参考译文。</strong></p>
        <h2 className="text-lg font-bold" style={heading}>1. 年龄限制</h2>
        <p>ABDL Space 桌面站、移动站及官方 App 仅面向年满18周岁的成年人。未满18周岁不得注册或使用；监护人同意、第三方账号授权或宝宝认证均不能替代这一要求。宝宝新天地等第三方的年龄规则不改变本站限制。</p>
        <h2 className="text-lg font-bold" style={heading}>2. 识别与服务限制</h2>
        <p>本站可能根据用户声明、资料或举报识别未成年人，不将普通登录或宝宝认证称为身份证实名或可靠的年龄核验。发现或有合理依据怀疑未成年人使用时，将核实并限制或终止相关服务，不以补交监护人同意恢复未成年人使用资格。</p>
        <h2 className="text-lg font-bold" style={heading}>3. 误收集信息的处理</h2>
        <p>如未成年人误注册、上传照片或发布内容，可由本人或监护人申请删除相关信息和账户。我们核实必要身份及监护关系后，依法处理删除或限制处理请求；必要的法律、安全与争议处理记录可能保留。退出登录、取消申请或删除客户端不等于服务器及第三方副本立即删除。</p>
        <h2 className="text-lg font-bold" style={heading}>4. 联系与权利申请</h2>
        <p>请联系 <a href="mailto:zhx589@outlook.com" style={link}>zhx589@outlook.com</a>，提供相关账号或内容链接及请求事项。首次联系请勿发送身份证照片或其他不必要的敏感资料。具体信息类别、第三方服务和权利渠道见<a href="/privacy" style={link}>《隐私政策》</a>；使用规则见<a href="/terms" style={link}>《用户协议》</a>。</p>
      </div>
      <div className="card mt-5 space-y-4 text-sm leading-relaxed break-words" style={text} lang="en">
        <h2 className="text-lg font-bold" style={heading}>English — official supplement</h2>
        <p>Updated and effective: October 3, 2026. Version 2026.10. This supplement does not create an exception allowing minors to use ABDL Space.</p>
        <h3 className="text-base font-bold" style={heading}>1. Age restriction</h3>
        <p>The desktop website, mobile website and official App are exclusively for adults aged 18 or older. Anyone under 18 must not register or use the service. Guardian consent, third-party authorization and Baby Verification do not override this restriction. NewBabyWorld and other providers' age rules do not change ours.</p>
        <h3 className="text-base font-bold" style={heading}>2. Identification and service restrictions</h3>
        <p>We may identify minors through declarations, profile information or reports. Ordinary login and Baby Verification are not identity-document verification or reliable age verification. When we discover, or have reasonable grounds to suspect, use by a minor, we will investigate and restrict or terminate the relevant service. Guardian consent will not restore eligibility while the user is under 18.</p>
        <h3 className="text-base font-bold" style={heading}>3. Information collected inadvertently</h3>
        <p>A minor or their guardian may request deletion of an inadvertently created account, uploaded photographs or posted content. After necessary identity and guardianship checks, we will handle deletion or restriction requests under applicable law. Necessary legal, security and dispute records may be retained. Logging out, cancelling an application or uninstalling the App does not immediately erase server data or third-party copies.</p>
        <h3 className="text-base font-bold" style={heading}>4. Contact and requests</h3>
        <p>Contact <a href="mailto:zhx589@outlook.com" style={link}>zhx589@outlook.com</a> with the account or content link and the requested action. Do not send identity-document photographs or other unnecessary sensitive information in your initial message. See the <a href="/privacy" style={link}>Privacy Policy</a> for data categories, providers and rights, and the <a href="/terms" style={link}>User Agreement</a> for service rules.</p>
      </div>
    </PageLayout>
  );
}
