import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ARCHIVE_LABELS,
  DELETE_LABELS,
  ERROR_LABELS,
  MAX_REASON,
  assetSummary,
  canRetry,
  legalNotice,
  postId,
  readCase,
  readCaseEnvelope,
  readSnapshot,
  readTarget,
  sourceRevision,
  validateReason,
} from './model.js';

const CASE_ID = '123e4567-e89b-42d3-a456-426614174000';
const ASSET_ID = '223e4567-e89b-42d3-a456-426614174001';
const REASON = '该内容包含违规公开引流信息';

function validCase(patch = {}) {
  return {
    id: CASE_ID,
    post_id: 7,
    author_id: 12,
    actor_id: 1,
    reason: REASON,
    notice: legalNotice(REASON),
    created_at: '2026-11-15T00:00:00Z',
    assets: [
      { id: ASSET_ID, position: 0, archive_state: 'verified', delete_state: 'deleted', thumbnail_available: true, error_code: null },
    ],
    ...patch,
  };
}

test('法律提示使用固定模板并对理由 trim 后逐字生成', () => {
  assert.equal(legalNotice('  违规引流  '), '根据互联网用户公众账号信息服务管理规定，此内容由于 违规引流 已被屏蔽');
  assert.equal(legalNotice(REASON), `根据互联网用户公众账号信息服务管理规定，此内容由于 ${REASON} 已被屏蔽`);
});

test('处理理由必须是 1–500 字纯文本且不接受 NUL', () => {
  assert.equal(validateReason('  理由  '), '理由');
  assert.throws(() => validateReason(''), /1–500/);
  assert.throws(() => validateReason('   '), /1–500/);
  assert.throws(() => validateReason('理'.repeat(MAX_REASON + 1)), /1–500/);
  assert.throws(() => validateReason('理由\0注入'), /NUL/);
  assert.throws(() => validateReason(7), /纯文本/);
});

test('帖子 ID 只接受安全正整数或其规范字符串', () => {
  assert.equal(postId(7), 7);
  assert.equal(postId('7'), 7);
  for (const value of [0, -1, 1.5, '01', '', '7x', null, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => postId(value), /帖子 ID 无效/);
});

test('案件解析采用白名单状态；未知错误码归为人工核查而不透传', () => {
  const parsed = readCase(validCase(), 7);
  assert.equal(parsed.id, CASE_ID);
  assert.equal(parsed.post_id, 7);
  assert.equal(parsed.reason, REASON);
  assert.equal(parsed.notice, legalNotice(REASON));
  assert.deepEqual(parsed.assets[0], { id: ASSET_ID, position: 0, archive_state: 'verified', delete_state: 'deleted', thumbnail_available: true, error_code: null });

  const unknown = readCase(validCase({ assets: [{ ...validCase().assets[0], error_code: 'internal_bucket_key' }] }), 7);
  assert.equal(unknown.assets[0].error_code, 'manual_review');
  assert.equal(ERROR_LABELS.manual_review, '需人工核查；不会绕过归档与删除安全检查');

  assert.throws(() => readCase(validCase({ reason: '未同步的理由' })), /违规处理响应格式异常/);
  assert.throws(() => readCase(validCase(), 8), /违规处理响应格式异常/);
  assert.throws(() => readCase(validCase({ assets: [{ ...validCase().assets[0], archive_state: 'claimed' }] })), /违规处理响应格式异常/);
  assert.throws(() => readCase(validCase({ assets: [validCase().assets[0], validCase().assets[0]] })), /违规处理响应格式异常/);
  assert.throws(() => readCase(validCase({ assets: [{ ...validCase().assets[0], position: -1 }] })), /违规处理响应格式异常/);
  assert.throws(() => readCase(validCase({ assets: [{ ...validCase().assets[0], thumbnail_available: 'yes' }] })), /违规处理响应格式异常/);
  assert.throws(() => readCase({ ...validCase(), id: 'not-a-uuid' }), /违规处理响应格式异常/);
});

test('目标与案件回执要求 schema_version=1、源版本和预期帖子一致', () => {
  const target = readTarget({ schema_version: 1, post_id: 7, source_revision: 'rev-20261115', moderation: null }, 7);
  assert.equal(target.source_revision, 'rev-20261115');
  assert.equal(target.moderation, null);
  assert.throws(() => readTarget({ schema_version: 2, post_id: 7, source_revision: 'rev', moderation: null }, 7), /违规处理响应格式异常/);
  assert.throws(() => readTarget({ schema_version: 1, post_id: 8, source_revision: 'rev', moderation: null }, 7), /违规处理响应格式异常/);
  assert.throws(() => readTarget({ schema_version: 1, post_id: 7, source_revision: 'a b', moderation: null }, 7), /违规处理响应格式异常/);
  assert.equal(sourceRevision('asset:7'), 'asset:7');

  const envelope = readCaseEnvelope({ schema_version: 1, moderation: validCase() }, CASE_ID, 7);
  assert.equal(envelope.moderation.post_id, 7);
  assert.throws(() => readCaseEnvelope({ schema_version: 1, moderation: validCase() }, '323e4567-e89b-42d3-a456-426614174002', 7), /违规处理响应格式异常/);

  const snapshot = readSnapshot({ schema_version: 1, case_id: CASE_ID, snapshot: { text: '<script>alert(1)</script>' } }, CASE_ID);
  assert.equal(snapshot.snapshot.text, '<script>alert(1)</script>');
  assert.throws(() => readSnapshot({ schema_version: 1, case_id: CASE_ID, snapshot: null }, CASE_ID), /违规处理响应格式异常/);
});

test('附件摘要与重试判断只使用已知状态，不宣称全部删除', () => {
  assert.equal(assetSummary([]), '无附件任务；文字原件永久留证');
  assert.equal(assetSummary([{ archive_state: 'verified', delete_state: 'deleted' }]), '附件归档已验证，删除已确认');
  assert.equal(assetSummary([{ archive_state: 'pending', delete_state: 'pending' }]), '附件任务处理中；归档与 COS 删除尚未全部确认');
  assert.equal(assetSummary([{ archive_state: 'blocked', delete_state: 'deleted' }]), '部分受阻 / 需人工处理；未宣称全部删除');
  assert.equal(assetSummary([{ archive_state: 'verified', delete_state: 'external' }]), '部分受阻 / 需人工处理；未宣称全部删除');
  assert.equal(canRetry({ assets: [{ archive_state: 'pending', delete_state: 'deleted' }] }), true);
  assert.equal(canRetry({ assets: [{ archive_state: 'verified', delete_state: 'pending' }] }), true);
  assert.equal(canRetry({ assets: [{ archive_state: 'verified', delete_state: 'deleted' }] }), false);
  assert.equal(canRetry(null), false);
  assert.deepEqual(Object.keys(ARCHIVE_LABELS).sort(), ['blocked', 'external', 'pending', 'verified']);
  assert.deepEqual(Object.keys(DELETE_LABELS).sort(), ['blocked', 'deleted', 'external', 'pending']);
});
