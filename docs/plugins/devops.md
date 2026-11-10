# devops-expert

Expert self-hosted IT/DevOps — containers, Kubernetes, Linux servers, networking, Proxmox VE, KVM/Incus, OpenStack, infrastructure as code, CI/CD, observability, storage and backup, secrets and stateful databases.

## Agent (1)

| Agent | Description |
|-------|-------------|
| `devops-expert` | Builds, operates and troubleshoots self-hosted infrastructure end to end: inspects read-only, previews every change (plan, diff, dry run, check mode), backs up stateful systems, applies after one go, verifies and keeps a rollback ready |

## Operations Safety Protocol

Discovery (read-only) → dry run (`plan`, `diff`, `--check`, `--dry-run=server`) → backup or snapshot of stateful systems → one go from the owner → apply → verify → rollback on a failed check, never a stacked fix. Destructive commands (`terraform destroy`, `kubectl delete`, `qm destroy`, `zfs destroy`, `rm -rf`) run only after an explicit go; secrets are never printed, committed or passed on a command line.

## Skills (18)

| Skill | Description |
|-------|-------------|
| `devops-docker` | Docker Engine (`daemon.json`), Compose, BuildKit/Buildx, safe port publishing next to a host firewall, private registry, cosign, Podman/Quadlet |
| `devops-kubernetes` | Workloads, Services, Gateway API, PV/PVC, RBAC, probes, HPA, NetworkPolicy, safe `kubectl`, pod troubleshooting |
| `devops-k8s-cluster` | kubeadm, k3s, Talos, HA control plane, etcd backup/restore, upgrades and version skew, Cilium, bare-metal LoadBalancer IPs |
| `devops-gitops-packaging` | Helm 4, Kustomize, Argo CD, Flux, GitOps repository layout, promotion, drift and rollback |
| `devops-linux` | Debian/Ubuntu and RHEL-family administration: systemd, apt/dnf, users/sudo/sshd, LVM/filesystems, sysctl, SELinux/AppArmor, performance troubleshooting, bash |
| `devops-networking` | nftables, bridges/bonds/VLANs, routing, DNS, TLS/ACME, reverse proxies (Traefik, Nginx, Caddy, HAProxy), WireGuard |
| `devops-opnsense` | OPNsense firewall/router: rules and NAT, DNS/DHCP (Unbound, Dnsmasq, Kea), VPN, multi-WAN, CARP HA, plugins, upgrades and rollback, config backup, REST API, Ansible/OpenTofu |
| `devops-proxmox` | Proxmox VE 9.x: clusters and quorum, HA, `storage.cfg`, SDN, PVE firewall, `qm`/`pct`, cloud-init templates, `pvesh`, upgrades from 8 |
| `devops-virtualization` | KVM/QEMU/libvirt, virtio and tuning, passthrough prerequisites, Incus/LXC, cloud-init NoCloud, Packer |
| `devops-openstack` | Service map (Keystone, Nova, Neutron/OVN, Glance, Cinder), SLURP upgrades, Kolla-Ansible / OpenStack-Ansible / OpenStack-Helm, `openstack` CLI, troubleshooting |
| `devops-iac` | OpenTofu and Terraform: providers, remote state, state surgery, modules, saved-plan workflow, drift, tests, Proxmox/OpenStack/Kubernetes providers |
| `devops-ansible` | Inventory, variable precedence, playbooks/roles/collections, idempotency, check mode, rolling updates, Vault, ansible-lint, Molecule |
| `devops-cicd` | GitHub Actions, GitLab CI, self-hosted runners, OIDC, caching, image builds in CI, deploy strategies and rollback |
| `devops-observability` | Prometheus and PromQL, Alertmanager, exporters, kube-prometheus-stack, Thanos/Mimir/VictoriaMetrics, Grafana as code, Loki with Alloy, OpenTelemetry |
| `devops-storage-backup` | ZFS, Ceph, NFS/iSCSI, S3-compatible storage, 3-2-1-1-0 strategy, restic, borg, Velero, restore tests, disaster recovery |
| `devops-sre-ops` | SLI/SLO and error budgets, burn-rate alerts, incident response, postmortems, change management, runbooks, capacity, DORA |
| `devops-secrets` | SOPS + age, Sealed Secrets, External Secrets, Vault/OpenBao, Kubernetes Secret handling, rotation, leak response |
| `devops-databases` | PostgreSQL tuning, PgBouncer, pgBackRest and PITR, replication, Patroni, upgrades, CloudNativePG; MariaDB, Redis/Valkey, MongoDB pointers |

## Out of Scope

- Public clouds (AWS, GCP, Azure) and their managed services: EKS/GKE/AKS, landing zones, FinOps.
- Hardening, security audit, secret scanning, CVE and supply-chain audit: `security-expert`.
- Application code, framework PaaS deploys and language CI gates: the framework and language experts.
- Repository commit and release flow: the commit agent.

## Detection

Routed by strong infrastructure indicators only (`*.tf`, `ansible.cfg`, `Chart.yaml`, `kustomization.yaml`, `*.pkr.hcl`, `.sops.yaml`) or by intent. A lone `Dockerfile` or `docker-compose.yml` inside an application repo does not route here; framework and language experts always win (see the project detection rule).

## Known Limits

Many of the shipped templates (Compose, Kubernetes manifests, Helm values, Terraform, Ansible, Prometheus rules and similar) were parsed for syntax but not validated by their native tool (`terraform validate`, `kubeconform`, `ansible-lint`, `promtool`, and so on). Run the native validator before applying anything to a live system.

## MCP Servers

- Context7 (documentation)
- Exa (web search)
- Sequential Thinking
- fuse-browser (fast-path fetch)

## SOLID Rules

- Scripts and code helpers follow the shared `solid-generic` skill
- Infrastructure artifacts (YAML, HCL, Dockerfile) follow the structure of the matching skill
- Plugin ships no hooks of its own

## Installation

Ships with the Fusengine Codex marketplace (plugin `devops-expert`):

```bash
codex plugin marketplace add https://github.com/fusengine/codex.git
~/.codex/.tmp/marketplaces/fusengine-codex/setup.sh
```
