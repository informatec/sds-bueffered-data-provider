# sds-bueffered-data-provider

Buffers data from MS SQL Server for direct accesss.

### Service Interface

__ID__ : numer

__PERIOD:__ number

__aggrLvl:__ string -> UPCASE

__measure:__ string -> UPCASE



example JSON RPC 2.0
```json
{
  "id": 1,
  "period": 201801,
  "aggrLvl": "TOTAL",
  "measure": "ACTUAL_POWER"
}
```
