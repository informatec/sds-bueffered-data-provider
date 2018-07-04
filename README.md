# sds-bueffered-data-provider

Buffers data from MS SQL Server for direct accesss.

### Service Interface

__PERIOD:__ number

__aggrLvl:__ string -> UPCASE

__measure:__ string -> UPCASE



example JSON RPC 2.0
```json
{
  "period": 201801,
  "aggrLvl": "TOTAL",
  "measure": "ACTUAL_POWER"
}
```
